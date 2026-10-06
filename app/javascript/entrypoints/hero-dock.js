import DOCK_CSS from '../hero-dock/hero-dock.css?inline';

const DEFAULT_PHRASE = '我想要註冊香港公司...';
const DEFAULT_TOPICS = [
  '我想註冊一間香港私人公司',
  '周年申報和 NAR1 可以一起辦嗎？',
  '怎樣核對這間公司有沒有 TCSP 牌？',
  '換公司秘書要準備什麼文件？',
  '報稅和做帳可以一起安排嗎？',
  '開 BVI 公司和開香港公司差在哪？',
  '年費之外還有沒有其他收費？',
  '公司成立大概要多久？',
  '無限公司和私人公司怎麼選？',
  '年審到期會不會提前提醒？',
];
const WIDGET_PREFIX = 'chatwoot-widget:';
const STYLE_ID = 'takehk-hero-dock-styles';

function reducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveTarget(target) {
  if (!target) return null;
  if (typeof target !== 'string') return target;
  if (
    target.charAt(0) === '#' ||
    target.charAt(0) === '.' ||
    target.charAt(0) === '['
  ) {
    return document.querySelector(target);
  }
  return document.getElementById(target);
}

function readCookie(name) {
  const parts = document.cookie ? document.cookie.split('; ') : [];
  const found = parts.find(part => {
    const key = part.split('=')[0];
    return key === name || key === encodeURIComponent(name);
  });
  if (!found) return '';
  return decodeURIComponent(found.slice(found.indexOf('=') + 1));
}

function writeCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )};path=/;max-age=${maxAge};SameSite=Lax`;
}

function conversationCookieName(websiteToken) {
  const safe = String(websiteToken).replace(/[^\w-]/g, '');
  return `cw_conversation_${safe}`;
}

function safeOrigin(baseUrl) {
  try {
    return new URL(baseUrl, window.location.href).origin;
  } catch (error) {
    return '*';
  }
}

function ensureCss() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = DOCK_CSS;
  document.head.appendChild(style);
}

function hideNativeBubble() {
  document.documentElement.classList.add('takehk-chat-dock');
  window.chatwootSettings = window.chatwootSettings || {};
  window.chatwootSettings.hideMessageBubble = true;
  if (
    window.$chatwoot &&
    typeof window.$chatwoot.toggleBubbleVisibility === 'function'
  ) {
    window.$chatwoot.toggleBubbleVisibility('hide');
  }
}

function syncScrollLock() {
  const anyFixed = document.querySelector('.thd-dock.is-fixed');
  document.documentElement.classList.toggle('thd-lock', !!anyFixed);
}

function mountStream(stream, topics, reduced) {
  if (!stream) return;
  const gap = 12;
  const speed = 28;
  const popDistance = 26;
  let cursor = 0;
  const items = [];

  function nextText() {
    const text = topics[cursor % topics.length];
    cursor += 1;
    return text;
  }

  function createBubble(text, settled) {
    const el = document.createElement('div');
    el.className = `thd-bubble${settled ? ' is-settled' : ''}`;
    el.textContent = text;
    stream.appendChild(el);
    return el;
  }

  function pushItem(el, y, popLeft) {
    const h = el.offsetHeight;
    el.style.transform = `translateY(${y}px)`;
    items.push({ el, y, h, popLeft });
  }

  if (reduced || !topics.length) {
    let bottomStill = stream.clientHeight - 4;
    const count = Math.min(3, topics.length);
    for (let n = 0; n < count; n += 1) {
      const still = createBubble(nextText(), true);
      const stillH = still.offsetHeight;
      bottomStill -= stillH;
      still.style.transform = `translateY(${bottomStill}px)`;
      bottomStill -= gap;
    }
    return;
  }

  let bottom = stream.clientHeight - 6;
  const seedCount = Math.min(2, topics.length);
  for (let i = 0; i < seedCount; i += 1) {
    const seeded = createBubble(nextText(), true);
    const seededH = seeded.offsetHeight;
    bottom -= seededH;
    pushItem(seeded, bottom, 0);
    bottom -= gap;
  }

  let lastTime = 0;

  function lowestItem() {
    return items.reduce(
      (best, item) => (!best || item.y > best.y ? item : best),
      null
    );
  }

  function spawnIfRoom() {
    const last = lowestItem();
    const limit = stream.clientHeight;
    if (last && last.y + last.h + gap > limit - popDistance) return;
    const el = createBubble(nextText(), false);
    pushItem(el, limit + 6, popDistance);
  }

  function frame(now) {
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    if (!document.hidden && dt) {
      for (let j = items.length - 1; j >= 0; j -= 1) {
        const item = items[j];
        const pop = Math.min(item.popLeft, 90 * dt);
        item.popLeft -= pop;
        item.y -= speed * dt + pop;
        item.el.style.transform = `translateY(${item.y}px)`;
        if (item.y + item.h < -12) {
          item.el.remove();
          items.splice(j, 1);
        }
      }
      spawnIfRoom();
    }
    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
}

function widgetSettings() {
  const settings = window.chatwootSettings || {};
  return {
    locale: settings.locale,
    position: settings.position === 'left' ? 'left' : 'right',
    hideMessageBubble: true,
    showPopoutButton: !!settings.showPopoutButton,
    showUnreadMessagesDialog: settings.showUnreadMessagesDialog !== false,
    widgetStyle: settings.widgetStyle || 'standard',
    darkMode: settings.darkMode || 'light',
    welcomeTitle: settings.welcomeTitle || '',
    welcomeDescription: settings.welcomeDescription || '',
    availableMessage: settings.availableMessage || '',
    unavailableMessage: settings.unavailableMessage || '',
    enableFileUpload: settings.enableFileUpload,
    enableEmojiPicker: settings.enableEmojiPicker !== false,
    enableEndConversation: settings.enableEndConversation !== false,
    campaignsSnoozedTill: readCookie('cw_snooze_campaigns_till'),
  };
}

function createLiveChat(options, requestClose) {
  const baseUrl = String(options.baseUrl || '').replace(/\/$/, '');
  const websiteToken = options.websiteToken || '';
  const origin = safeOrigin(baseUrl);
  const cookieName = conversationCookieName(websiteToken);
  let iframe = null;
  let ready = false;
  let wantsOpen = false;

  function post(payload) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      `${WIDGET_PREFIX}${JSON.stringify(payload)}`,
      origin
    );
  }

  function publishOpenState() {
    if (!ready) return;
    post({ event: 'toggle-open', isOpen: wantsOpen });
    if (wantsOpen) {
      post({ event: 'push-event', eventName: 'webwidget.triggered' });
    }
  }

  function handleMessage(event) {
    if (!iframe || event.source !== iframe.contentWindow) return;
    if (origin !== '*' && event.origin !== origin) return;
    if (
      typeof event.data !== 'string' ||
      event.data.indexOf(WIDGET_PREFIX) !== 0
    ) {
      return;
    }

    let message;
    try {
      message = JSON.parse(event.data.slice(WIDGET_PREFIX.length));
    } catch (error) {
      return;
    }

    if (message.event === 'loaded') {
      const authToken = message.config && message.config.authToken;
      if (authToken) writeCookie(cookieName, authToken);
      ready = true;
      const config = widgetSettings();
      if (!config.locale) delete config.locale;
      post({ event: 'config-set', ...config });
      post({
        event: 'change-url',
        referrerURL: window.location.href,
        referrerHost: window.location.host,
      });
      publishOpenState();
      return;
    }

    if (message.event === 'setAuthCookie') {
      const authToken = message.data && message.data.widgetAuthToken;
      if (authToken) writeCookie(cookieName, authToken);
      return;
    }

    if (message.event === 'closeWindow' || message.event === 'closeChat') {
      requestClose();
    }
  }

  return {
    mount(stage) {
      if (!baseUrl || !websiteToken) return;
      const thread = stage.querySelector('[data-thd-thread]');
      if (!thread || thread.querySelector('iframe')) return;

      window.addEventListener('message', handleMessage);
      const saved = readCookie(cookieName) || readCookie('cw_conversation');
      const frame = document.createElement('iframe');
      const params = new URLSearchParams({
        website_token: websiteToken,
        hero_dock: '1',
      });
      if (saved) params.set('cw_conversation', saved);
      frame.className = 'thd-frame';
      frame.title = 'Chat';
      frame.allow =
        'camera;microphone;fullscreen;display-capture;picture-in-picture;clipboard-write;';
      frame.src = `${baseUrl}/widget?${params.toString()}`;
      thread.appendChild(frame);
      iframe = frame;
    },
    setOpen(isOpen) {
      wantsOpen = !!isOpen;
      publishOpenState();
    },
  };
}

function mountDock(root, options) {
  const dock = root.querySelector('[data-thd-dock]');
  const typed = root.querySelector('[data-thd-typed]');
  const openBtn = root.querySelector('[data-thd-open]');
  const closeBtn = root.querySelector('[data-thd-close]');
  const stage = root.querySelector('[data-thd-stage]');
  if (!dock || !typed || !openBtn || !stage) return { close() {} };

  const phrase = options.phrase || DEFAULT_PHRASE;
  const reduced = !!options.reducedMotion;
  let timer = null;
  let index = 0;
  let deleting = false;
  let placeholder = null;
  let closing = false;

  function paintTyped(count) {
    typed.textContent = phrase.slice(0, count);
  }

  function step() {
    if (dock.classList.contains('is-open')) return;
    if (reduced) {
      paintTyped(phrase.length);
      return;
    }
    if (!deleting) {
      index += 1;
      paintTyped(index);
      if (index >= phrase.length) {
        deleting = true;
        timer = window.setTimeout(step, 1700);
        return;
      }
      timer = window.setTimeout(step, 68 + Math.random() * 50);
      return;
    }
    index -= 1;
    paintTyped(Math.max(index, 0));
    if (index <= 0) {
      deleting = false;
      index = 0;
      timer = window.setTimeout(step, 460);
      return;
    }
    timer = window.setTimeout(step, 34);
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function place(box) {
    dock.style.top = `${box.top}px`;
    dock.style.left = `${box.left}px`;
    dock.style.width = `${box.width}px`;
    dock.style.height = `${box.height}px`;
  }

  function viewport() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  function open() {
    if (dock.classList.contains('is-fixed')) return;
    const rect = dock.getBoundingClientRect();
    const dockStyle = window.getComputedStyle(dock);
    dock.style.transform = 'none';
    placeholder = document.createElement('div');
    placeholder.className = 'thd-dock-placeholder';
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.marginTop = dockStyle.marginTop;
    placeholder.style.marginBottom = dockStyle.marginBottom;
    dock.parentNode.insertBefore(placeholder, dock);
    dock.classList.add('is-fixed');
    place(rect);
    openBtn.setAttribute('aria-expanded', 'true');
    stage.removeAttribute('inert');
    syncScrollLock();
    clearTimer();
    window.requestAnimationFrame(() => {
      dock.classList.add('is-animating');
      window.requestAnimationFrame(() => {
        dock.classList.add('is-open');
        place(viewport());
        window.setTimeout(
          () => {
            if (closeBtn) closeBtn.focus();
          },
          reduced ? 0 : 460
        );
        if (typeof options.onOpen === 'function') options.onOpen(stage);
      });
    });
  }

  function finishClose() {
    if (!dock.classList.contains('is-fixed')) return;
    dock.classList.remove('is-fixed', 'is-animating');
    dock.style.top = '';
    dock.style.left = '';
    dock.style.width = '';
    dock.style.height = '';
    dock.style.transform = '';
    if (placeholder) {
      placeholder.remove();
      placeholder = null;
    }
    stage.setAttribute('inert', '');
    syncScrollLock();
    closing = false;
    openBtn.focus();
    step();
    if (typeof options.onClose === 'function') options.onClose();
  }

  function close() {
    if (!dock.classList.contains('is-open') || closing) return;
    closing = true;
    const rect = placeholder ? placeholder.getBoundingClientRect() : null;
    dock.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    if (!rect) {
      finishClose();
      return;
    }
    place(rect);
    if (reduced) {
      finishClose();
      return;
    }
    const fallback = window.setTimeout(finishClose, 760);
    dock.addEventListener('transitionend', function onEnd(event) {
      if (event.target !== dock || event.propertyName !== 'height') return;
      window.clearTimeout(fallback);
      dock.removeEventListener('transitionend', onEnd);
      finishClose();
    });
  }

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dock.classList.contains('is-open')) {
      event.preventDefault();
      close();
    }
  });
  window.addEventListener('resize', () => {
    if (dock.classList.contains('is-open')) place(viewport());
  });
  step();

  return { close };
}

function render(target, options) {
  const phrase = options.phrase || DEFAULT_PHRASE;
  const watermark = options.watermark == null ? 'AI' : options.watermark;
  target.innerHTML = `<div class="thd-hero">
      <div class="thd-stream" data-thd-stream aria-hidden="true"></div>
      <div class="thd-dock" data-thd-dock>
        <span class="thd-watermark" aria-hidden="true">${escapeHtml(watermark)}</span>
        <button type="button" class="thd-face" data-thd-open aria-expanded="false">
          <span data-thd-typed></span><span class="thd-caret"></span>
        </button>
        <div class="thd-stage" data-thd-stage inert>
          <button type="button" class="thd-close" data-thd-close>關閉</button>
          <div class="thd-thread" data-thd-thread></div>
        </div>
      </div>
    </div>`;
  target.querySelector('[data-thd-typed]').setAttribute('data-phrase', phrase);
}

export function run(options) {
  const settings = options || {};
  const target = resolveTarget(settings.target);
  if (!target || target.querySelector('[data-thd-dock]')) return;

  ensureCss();
  hideNativeBubble();
  const reduced = reducedMotion();
  render(target, settings);

  const topics = settings.topics || DEFAULT_TOPICS;
  mountStream(target.querySelector('[data-thd-stream]'), topics, reduced);

  let dockApi = { close() {} };
  const widget = createLiveChat(settings, () => dockApi.close());
  dockApi = mountDock(target, {
    phrase: settings.phrase || DEFAULT_PHRASE,
    reducedMotion: reduced,
    onOpen(stage) {
      widget.mount(stage);
      widget.setOpen(true);
    },
    onClose() {
      widget.setOpen(false);
    },
  });
}

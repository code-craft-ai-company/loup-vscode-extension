// Loup trace viewer — the page inside the custom editor.
//
// It draws what the extension sends and reports what the reader does. Every
// string from the trace reaches the page through textContent, never as HTML.
(function () {
  'use strict';
  const vscode = acquireVsCodeApi();
  const app = document.getElementById('app');

  /** How many rows are drawn at once; a longer list is windowed around the cursor. */
  const MAX_ROWS = 1500;

  const state = {
    phase: 'loading', // loading | error | view
    file: '',
    message: '',
    view: null,
    canQuery: false,
    cursor: { capture: 0, item: 0, pointLabel: '', agentPoint: null },
    off: new Set(), // kinds hidden by the filter chips
    note: '',
    noteError: false,
    query: { text: '', busy: false, result: null, error: '' },
  };

  function send(message) {
    vscode.postMessage(message);
  }

  // ---- DOM helpers ----

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const key of Object.keys(attrs)) {
        const value = attrs[key];
        if (value === undefined || value === null || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'on') {
          for (const ev of Object.keys(value)) node.addEventListener(ev, value[ev]);
        } else node.setAttribute(key, value === true ? '' : String(value));
      }
    }
    for (const child of children || []) {
      if (child === null || child === undefined || child === false) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function button(label, title, onClick, cls) {
    return el('button', { class: cls, title: title, text: label, on: { click: onClick } });
  }

  function siteText(site) {
    if (!site || !site.file) return '';
    return site.file + ':' + site.line;
  }

  function shortSite(site) {
    if (!site || !site.file) return '';
    const parts = site.file.split('/');
    return parts[parts.length - 1] + ':' + site.line;
  }

  function isBadExit(exit) {
    return /thr|exc|fail|abort|panic/i.test(exit || '');
  }

  // ---- Screens ----

  function renderLoading() {
    app.replaceChildren(
      el('div', { class: 'center' }, [el('p', { text: 'Reading ' + (state.file || 'the trace') + ' …' })])
    );
  }

  function renderError() {
    app.replaceChildren(
      el('div', { class: 'center' }, [
        el('h3', { text: 'This trace could not be opened' }),
        el('pre', { text: state.message }),
        el('div', { class: 'actions' }, [
          button('Try again', 'Read the file again', function () { send({ type: 'reload' }); }, 'primary'),
          button('Open settings', 'Set where the Loup toolchain is', function () { send({ type: 'settings' }); }),
        ]),
      ])
    );
  }

  function currentCapture() {
    return state.view.captures[state.cursor.capture];
  }

  function currentItem() {
    const c = currentCapture();
    return c ? c.items[state.cursor.item] : undefined;
  }

  function renderHeader() {
    const t = state.view.trace;
    const r = t.recording;
    const facts = [];
    if (r.lane) facts.push('lane ' + r.lane);
    if (r.mode) facts.push('recording ' + r.mode);
    if (r.executionMode) facts.push(r.executionMode);
    if (r.target) facts.push(r.target);
    if (t.identity.toolchain) facts.push('toolchain ' + t.identity.toolchain);
    if (r.chaosSeed !== null && r.chaosSeed !== undefined) facts.push('chaos seed ' + r.chaosSeed);
    const total = state.view.captures.reduce(function (n, c) { return n + c.items.length; }, 0);
    return el('div', { class: 'header' }, [
      el('span', { class: 'title', text: state.file.split(/[\\/]/).pop() || 'trace' }),
      el('span', { class: 'mono dim', text: 'trace ' + t.id }),
      el('span', { class: 'dim', text: facts.join(' · ') }),
      el('span', { class: 'spacer' }),
      el('span', {
        class: 'dim',
        text: state.view.captures.length + (state.view.captures.length === 1 ? ' capture, ' : ' captures, ') +
          total + ' records',
      }),
      button('Reload', 'Read the file again', function () { send({ type: 'reload' }); }),
    ]);
  }

  function renderCaptures() {
    const bar = el('div', { class: 'captures', role: 'tablist', 'aria-label': 'Captures' });
    state.view.captures.forEach(function (c, i) {
      if (i > 0) bar.appendChild(el('span', { class: 'gap-between dim', text: '· not recorded ·' }));
      const cls = 'capture' + (i === state.cursor.capture ? ' current' : '');
      const b = el('button', {
        class: cls,
        role: 'tab',
        'aria-selected': i === state.cursor.capture ? 'true' : 'false',
        title: 'Capture ' + c.id + ': ' + c.anchor + ', task ' + c.task + ', ' + c.bytes + ' bytes' +
          (c.hasCheckpoint ? '' : ', no entry checkpoint'),
        on: { click: function () { send({ type: 'goto', capture: i, item: 0 }); } },
      }, [
        el('span', { class: 'mono', text: c.anchor }),
        el('span', { class: 'exit' + (isBadExit(c.exit) ? ' bad' : ''), text: c.exit }),
        el('span', { class: 'dim', text: String(c.items.length) }),
      ]);
      bar.appendChild(b);
    });
    return bar;
  }

  function renderToolbar() {
    const gotoInput = el('input', {
      type: 'text',
      placeholder: 'Go to point: exception#0, portal(name)#2, a bookmark …',
      'aria-label': 'Go to point',
      on: {
        keydown: function (e) {
          if (e.key === 'Enter' && e.target.value.trim()) send({ type: 'gotoPoint', text: e.target.value });
          e.stopPropagation();
        },
      },
    });
    return el('div', { class: 'toolbar' }, [
      el('div', { class: 'group' }, [
        button('⏮ Capture', 'Previous capture  [', function () { send({ type: 'stepCapture', dir: 'backward' }); }),
        button('◀ Exception', 'Previous exception  Shift+E',
          function () { send({ type: 'stepKind', dir: 'backward', kinds: ['Exception'] }); }),
        button('◀ Back', 'Previous record  ← or K', function () { send({ type: 'step', dir: 'backward' }); }),
        button('Forward ▶', 'Next record  → or J', function () { send({ type: 'step', dir: 'forward' }); }),
        button('Exception ▶', 'Next exception  E',
          function () { send({ type: 'stepKind', dir: 'forward', kinds: ['Exception'] }); }),
        button('Capture ⏭', 'Next capture  ]', function () { send({ type: 'stepCapture', dir: 'forward' }); }),
      ]),
      el('div', { class: 'group' }, [
        button('◀ This line', 'Previous record at this source line  Shift+L',
          function () { send({ type: 'stepLine', dir: 'backward' }); }),
        button('This line ▶', 'Next record at this source line  L',
          function () { send({ type: 'stepLine', dir: 'forward' }); }),
      ]),
      el('div', { class: 'goto' }, [gotoInput]),
    ]);
  }

  function renderNote() {
    return el('div', {
      class: 'note' + (state.noteError ? ' error' : ' dim'),
      role: 'status',
      'aria-live': 'polite',
      text: state.note,
    });
  }

  function kindCounts(capture) {
    const counts = new Map();
    for (const it of capture.items) counts.set(it.kind, (counts.get(it.kind) || 0) + 1);
    return Array.from(counts.entries()).sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
  }

  function renderFilters(capture) {
    const row = el('div', { class: 'filters', 'aria-label': 'Show record kinds' });
    for (const entry of kindCounts(capture)) {
      const kind = entry[0];
      const on = !state.off.has(kind);
      row.appendChild(el('button', {
        class: 'chip' + (on ? ' on' : ''),
        'aria-pressed': on ? 'true' : 'false',
        title: (on ? 'Hide ' : 'Show ') + kind + ' records',
        text: kind + ' ' + entry[1],
        on: {
          click: function () {
            if (state.off.has(kind)) state.off.delete(kind); else state.off.add(kind);
            render();
          },
        },
      }));
    }
    return row;
  }

  function renderRows(capture) {
    const list = el('div', { class: 'rows mono', role: 'listbox', 'aria-label': 'Records of this capture' });
    const shown = [];
    capture.items.forEach(function (it, i) {
      if (!state.off.has(it.kind) || i === state.cursor.item) shown.push(i);
    });
    let from = 0;
    let to = shown.length;
    if (shown.length > MAX_ROWS) {
      const at = Math.max(0, shown.indexOf(state.cursor.item));
      from = Math.max(0, Math.min(at - Math.floor(MAX_ROWS / 2), shown.length - MAX_ROWS));
      to = from + MAX_ROWS;
      list.appendChild(el('div', {
        class: 'more dim',
        text: 'Showing records ' + (from + 1) + '–' + to + ' of ' + shown.length +
          ' around the current one. Narrow the list with the kind filters or a query.',
      }));
    }
    if (shown.length === 0) {
      list.appendChild(el('div', { class: 'more dim', text: 'This capture holds no records.' }));
    }
    for (let k = from; k < to; k++) {
      const i = shown[k];
      const it = capture.items[i];
      const site = it.site >= 0 ? state.view.sites[it.site] : undefined;
      const current = i === state.cursor.item;
      const row = el('div', {
        class: 'row' + (current ? ' current' : ''),
        role: 'option',
        'aria-selected': current ? 'true' : 'false',
        tabindex: current ? '0' : '-1',
        title: it.summary,
        on: { click: function () { send({ type: 'goto', capture: state.cursor.capture, item: i }); } },
      }, [
        el('span', { class: 'seq', text: String(it.seq) }),
        el('span', { class: 'kind k-' + it.kind.replace(/[^A-Za-z]/g, ''), text: it.kind }),
        el('span', { class: 'task', text: 't' + it.task }),
        el('span', { class: 'summary', text: it.point ? it.point + '  ' + it.summary : it.summary }),
        el('span', { class: 'where', text: shortSite(site) }),
      ]);
      if (current) row.id = 'current-row';
      list.appendChild(row);
    }
    return list;
  }

  function kv(pairs) {
    const grid = el('div', { class: 'kv' });
    for (const pair of pairs) {
      if (pair[1] === undefined || pair[1] === null || pair[1] === '') continue;
      grid.appendChild(el('span', { class: 'k', text: pair[0] }));
      grid.appendChild(typeof pair[1] === 'string'
        ? el('span', { class: 'v mono', text: pair[1] })
        : el('span', { class: 'v mono' }, [pair[1]]));
    }
    return grid;
  }

  function renderInspector(capture) {
    const it = currentItem();
    const box = el('div', {});
    box.appendChild(el('h3', { text: 'Current record' }));
    if (!it) {
      box.appendChild(el('div', { class: 'dim', text: 'This capture holds no records.' }));
    } else {
      const site = it.site >= 0 ? state.view.sites[it.site] : undefined;
      box.appendChild(el('div', { class: 'summary-line mono', text: it.summary }));
      const pointCell = el('span', {}, [
        document.createTextNode(state.cursor.pointLabel + '  '),
        state.cursor.agentPoint
          ? button('Copy', 'Copy ' + state.cursor.agentPoint + ' (the form the agent tools take)',
              function () { send({ type: 'copy', text: state.cursor.agentPoint }); }, 'link')
          : null,
      ]);
      box.appendChild(kv([
        ['kind', it.kind],
        ['point', pointCell],
        ['task', String(it.task)],
        ['seq', String(it.seq)],
        ['step', it.step === null || it.step === undefined ? '' : String(it.step)],
        ['callable', site ? site.callable : ''],
        ['location', site && site.file
          ? button(siteText(site), 'Show this line in the editor',
              function () { send({ type: 'openSite', site: it.site }); }, 'link')
          : ''],
      ]));
      const names = Object.keys(it.detail || {});
      if (names.length > 0) {
        box.appendChild(el('h3', { text: 'Recorded fields' }));
        box.appendChild(kv(names.map(function (n) { return [n, it.detail[n]]; })));
      }
    }
    box.appendChild(el('div', {
      class: 'hint',
      text: 'This view shows what the file holds: recorded inputs, outputs and anchors. Locals and the call ' +
        'stack at a point come from replaying the capture, which needs a replay engine.',
    }));

    box.appendChild(el('h3', { text: 'Capture' }));
    box.appendChild(kv([
      ['point', capture.anchor],
      ['exit', capture.exit],
      ['tasks', capture.tasks.join(', ')],
      ['size', capture.bytes + ' bytes'],
      ['entry checkpoint', capture.hasCheckpoint ? 'yes' : 'no'],
      ['replayed on', capture.lanes.map(function (l) {
        return l.lane + ' (' + l.checkpoints + ' checkpoints)';
      }).join(', ')],
    ]));

    const gaps = state.view.gaps.filter(function (g) { return g.capture === capture.id; });
    if (gaps.length > 0) {
      box.appendChild(el('h3', { text: 'Gaps in this capture' }));
      for (const g of gaps) {
        box.appendChild(el('div', { class: 'list-item' }, [
          button('seq ' + g.seq, 'Go to this gap',
            function () { send({ type: 'gotoSeq', capture: capture.id, seq: g.seq }); }, 'link mono'),
          document.createTextNode('  ' + g.seam + ': ' + g.reason),
        ]));
      }
    }

    if (state.view.bookmarks.length > 0) {
      box.appendChild(el('h3', { text: 'Bookmarks' }));
      for (const b of state.view.bookmarks) {
        box.appendChild(el('div', { class: 'list-item' }, [
          button(b.name, 'Go to ' + b.anchor, function () { send({ type: 'gotoPoint', text: b.name }); }, 'link mono'),
          document.createTextNode('  ' + b.anchor + (b.note ? ' — ' + b.note : '')),
        ]));
      }
    }

    box.appendChild(renderQuery());
    return box;
  }

  function renderQuery() {
    const q = state.query;
    const box = el('div', {});
    box.appendChild(el('h3', { text: 'Query' }));
    const input = el('input', {
      type: 'text',
      value: q.text,
      placeholder: 'exception(ValueError) · seam(fs.read) · output(stderr) where text.contains("warn")',
      'aria-label': 'Trace query',
      disabled: !state.canQuery,
      on: {
        input: function (e) { q.text = e.target.value; },
        keydown: function (e) {
          if (e.key === 'Enter' && e.target.value.trim()) send({ type: 'query', text: e.target.value });
          e.stopPropagation();
        },
      },
    });
    box.appendChild(el('div', { class: 'query' }, [
      input,
      el('button', {
        text: 'Run',
        disabled: !state.canQuery || q.busy,
        on: { click: function () { if (q.text.trim()) send({ type: 'query', text: q.text }); } },
      }),
    ]));
    if (!state.canQuery) {
      box.appendChild(el('div', {
        class: 'dim',
        text: 'Queries run against the .ltrace file; this is an exported view.',
      }));
    }
    const hits = el('div', { class: 'hits', role: 'status', 'aria-live': 'polite' });
    if (q.busy) {
      hits.appendChild(el('div', { class: 'dim', text: 'Running …' }));
    } else if (q.error) {
      hits.appendChild(el('div', { class: 'note error', text: q.error }));
    } else if (q.result) {
      const r = q.result;
      hits.appendChild(el('div', {
        class: 'dim',
        text: r.count + (r.count === 1 ? ' hit' : ' hits') +
          (r.truncated ? ', showing the first ' + r.hits.length : ''),
      }));
      if (r.unavailable > 0) {
        hits.appendChild(el('div', {
          class: 'dim',
          text: r.unavailable + ' more could not be decided: the recording does not hold the values the ' +
            'condition reads.',
        }));
      }
      for (const h of r.hits) {
        const site = h.site >= 0 ? state.view.sites[h.site] : undefined;
        const label = (h.point || 'capture ' + h.capture + ' seq ' + h.seq) + '  ' + h.summary +
          (site && site.file ? '  ' + shortSite(site) : '');
        hits.appendChild(button(label, 'Go to this hit',
          function () { send({ type: 'gotoSeq', capture: h.capture, seq: h.seq }); }, 'link hit mono'));
      }
    }
    box.appendChild(hits);
    return box;
  }

  function renderView() {
    const capture = currentCapture();
    if (!capture) {
      app.replaceChildren(
        renderHeader(),
        el('div', { class: 'center' }, [
          el('p', {
            text: 'This trace holds no captures. A capture is recorded each time an activated portal is hit ' +
              'while recording is armed.',
          }),
        ])
      );
      return;
    }
    const keepQueryFocus = document.activeElement && document.activeElement.getAttribute('aria-label') === 'Trace query';
    app.replaceChildren(
      renderHeader(),
      renderCaptures(),
      renderToolbar(),
      renderNote(),
      el('div', { class: 'main' }, [
        el('div', { class: 'left' }, [renderFilters(capture), renderRows(capture)]),
        el('div', { class: 'right' }, [renderInspector(capture)]),
      ])
    );
    const row = document.getElementById('current-row');
    if (row) row.scrollIntoView({ block: 'nearest' });
    if (keepQueryFocus) {
      const input = document.querySelector('input[aria-label="Trace query"]');
      if (input) input.focus();
    }
  }

  function render() {
    if (state.phase === 'loading') renderLoading();
    else if (state.phase === 'error') renderError();
    else renderView();
  }

  // ---- Messages from the extension ----

  window.addEventListener('message', function (event) {
    const m = event.data;
    switch (m.type) {
      case 'loading':
        state.phase = 'loading';
        state.file = m.file;
        break;
      case 'loadError':
        state.phase = 'error';
        state.message = m.message;
        break;
      case 'view':
        state.phase = 'view';
        state.view = m.view;
        state.file = m.file;
        state.canQuery = m.canQuery;
        state.cursor = m.cursor;
        state.note = '';
        state.noteError = false;
        break;
      case 'cursor':
        state.cursor = m.cursor;
        state.note = m.note || '';
        state.noteError = false;
        break;
      case 'note':
        state.note = m.message;
        state.noteError = !!m.error;
        break;
      case 'queryBusy':
        state.query = { text: m.query, busy: true, result: null, error: '' };
        break;
      case 'queryResult':
        state.query = { text: m.query, busy: false, result: m.result || null, error: m.error || '' };
        break;
      default:
        return;
    }
    render();
  });

  // ---- Keys ----

  window.addEventListener('keydown', function (e) {
    if (state.phase !== 'view' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    const dir = e.shiftKey ? 'backward' : 'forward';
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'j':
        send({ type: 'step', dir: 'forward' }); break;
      case 'ArrowLeft': case 'ArrowUp': case 'k':
        send({ type: 'step', dir: 'backward' }); break;
      case 'e': case 'E':
        send({ type: 'stepKind', dir: dir, kinds: ['Exception'] }); break;
      case 'l': case 'L':
        send({ type: 'stepLine', dir: dir }); break;
      case ']':
        send({ type: 'stepCapture', dir: 'forward' }); break;
      case '[':
        send({ type: 'stepCapture', dir: 'backward' }); break;
      default:
        return;
    }
    e.preventDefault();
  });

  render();
  send({ type: 'ready' });
})();

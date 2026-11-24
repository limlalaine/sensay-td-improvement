/*
 * dc-lite.js — a tiny template renderer for the Sensay teacher-platform mockups.
 * Supports {{path}} holes, <sc-for list as>, <sc-if value>, and onClick/onInput/onChange handlers.
 * Mockup only: re-renders the whole page on every state change.
 */
(function () {
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var VOID = /<(input|br|img|meta|link|hr)(\b[^>]*?)\s*\/?>/g;

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      return v == null ? '' : String(v);
    });
  }

  function build(node, scope, inSvg, out) {
    if (node.nodeType === 3) {
      out.push(document.createTextNode(interp(node.nodeValue, scope)));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'helmet') return;
    if (tag === 'sc-for') {
      var list = lookup(scope, (node.getAttribute('list') || '').replace(/[{}]/g, '')) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (item, idx) {
        var s = Object.create(scope);
        s[as] = item; s.$index = idx;
        kids(node, s, inSvg, out);
      });
      return;
    }
    if (tag === 'sc-if') {
      var v = lookup(scope, (node.getAttribute('value') || '').replace(/[{}]/g, ''));
      if (v) kids(node, scope, inSvg, out);
      return;
    }
    var svg = inSvg || tag === 'svg';
    var el = svg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], name = a.name, raw = a.value;
      if (name.indexOf('hint-') === 0) continue;
      var whole = raw.match(WHOLE);
      if (/^on[A-Z]/.test(name)) {
        var fn = whole ? lookup(scope, whole[1]) : null;
        if (typeof fn === 'function') el.addEventListener(name.slice(2).toLowerCase(), fn);
        continue;
      }
      var val = whole ? lookup(scope, whole[1]) : interp(raw, scope);
      if (name === 'checked') { el.checked = !!val; continue; }
      if (name === 'value' && !svg) { el.value = val == null ? '' : val; el.setAttribute('value', val == null ? '' : val); continue; }
      if (val === undefined || val === null) continue;
      el.setAttribute(name, String(val));
    }
    var children = [];
    kids(node, scope, svg, children);
    children.forEach(function (c) { el.appendChild(c); });
    out.push(el);
  }
  function kids(node, scope, inSvg, out) {
    for (var c = node.firstChild; c; c = c.nextSibling) build(c, scope, inSvg, out);
  }

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    if (this._render) this._render();
  };
  window.DCLogic.prototype.forceUpdate = function () { if (this._render) this._render(); };

  window.mountDC = function (Component, templateId, rootId) {
    var src = document.getElementById(templateId).textContent.replace(VOID, '<$1$2/>');
    var doc = new DOMParser().parseFromString('<root>' + src + '</root>', 'application/xml');
    var err = doc.getElementsByTagName('parsererror')[0];
    if (err) { document.body.textContent = 'Template error: ' + err.textContent; return; }
    var tpl = doc.documentElement, root = document.getElementById(rootId);
    var comp = new Component({});
    comp._render = function () {
      var active = document.activeElement, id = active && active.id, selStart = null, selEnd = null;
      try { selStart = active.selectionStart; selEnd = active.selectionEnd; } catch (e) {}
      var scrolls = {};
      root.querySelectorAll('[data-keep-scroll]').forEach(function (n) { scrolls[n.getAttribute('data-keep-scroll')] = [n.scrollTop, n.scrollLeft]; });
      var out = [];
      kids(tpl, comp.renderVals(), false, out);
      root.replaceChildren.apply(root, out);
      Object.keys(scrolls).forEach(function (k) {
        var n = root.querySelector('[data-keep-scroll="' + k + '"]'); if (n) { n.scrollTop = scrolls[k][0]; n.scrollLeft = scrolls[k][1]; }
      });
      if (id) {
        var again = document.getElementById(id);
        if (again) { again.focus(); try { if (selStart != null) again.setSelectionRange(selStart, selEnd); } catch (e) {} }
      }
    };
    comp._render();
    return comp;
  };
})();

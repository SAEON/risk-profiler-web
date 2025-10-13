import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/api";

/**
 * Props:
 *  - api: string (base API URL, e.g. "http://localhost:4001")
 *  - onSelect: (item) => void  // item = { code, name, bbox: [minx,miny,maxx,maxy] }
 */
export default function MunicipalitySearch({ onSelect }) {
  const [all, setAll] = useState([]);       // [{code,name,bbox:[minx,miny,maxx,maxy]}]
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // load full list once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const json = await api.getMunicipalities();
        if (!cancelled) setAll(Array.isArray(json) ? json : []);
      } catch {
        if (!cancelled) setAll([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  // normalize and filter
  const norm = (s) => String(s || "").toLowerCase().normalize("NFKD");
  const filtered = useMemo(() => {
    const qq = norm(q);
    if (!qq) return [];
    const byScore = all
      .map((m) => {
        const name = norm(m.name);
        const code = String(m.code || "");
        // simple scoring: startsWith > includes(code) > includes(name)
        let score = 0;
        if (name.startsWith(qq)) score += 4;
        if (name.includes(qq)) score += 1;
        if (code.includes(qq)) score += 2;
        return { ...m, _score: score };
      })
      .filter((m) => m._score > 0)
      .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name));
    return byScore.slice(0, 10);
  }, [all, q]);

  // keyboard handling on input
  const onInputKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const first = listRef.current?.querySelector("button");
      first?.focus();
    }
  };

  const clearSearch = () => {
    setQ("");
    setOpen(false);
    inputRef.current?.focus();
  };

  // keyboard handling on list buttons (roving focus)
  const onItemKeyDown = (e, item) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePick(item);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const buttons = Array.from(listRef.current?.querySelectorAll("button") || []);
      const idx = buttons.indexOf(e.currentTarget);
      const nextIdx = e.key === "ArrowDown" ? Math.min(idx + 1, buttons.length - 1)
                                            : Math.max(idx - 1, 0);
      buttons[nextIdx]?.focus();
    }
  };

  const handlePick = (item) => {
    setOpen(false);
    setQ(item?.name || "");
    onSelect?.(item);
  };

  const showList = open && q && (filtered.length > 0 || !loading);

  return (
    <div className="searchbox">
      <label className="searchbox__label" htmlFor="searchbox-input">
        Municipality search
      </label>

      <div className={`searchbox__control ${open ? "is-open" : ""}`}>
        <input
          id="searchbox-input"
          ref={inputRef}
          className="searchbox__input"
          type="text"
          value={q}
          placeholder="Type municipality name or code…"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
        />

        {/* right-side hints / spinner / clear */}
        {loading ? (
          <div className="searchbox__spinner" aria-hidden />
        ) : q ? (
          <button type="button" className="searchbox__clear" onClick={clearSearch} aria-label="Clear">×</button>
        ) : (
          <kbd className="searchbox__kbd">/</kbd>
        )}
      </div>

      {showList && (
        <div className="searchbox__list" role="listbox" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="searchbox__empty">No matches</div>
          ) : (
            filtered.map((m) => (
              <button
                key={m.code}
                type="button"
                className="searchbox__item"
                role="option"
                onClick={() => handlePick(m)}
                onKeyDown={(e) => onItemKeyDown(e, m)}
                title={m.name}
              >
                <div className="searchbox__item-name">{m.name}</div>
                <div className="searchbox__item-sub">{String(m.code)}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

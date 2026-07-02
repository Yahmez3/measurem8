/* MeasureMate — Universal Unit Converter
 * Vanilla JS, zero dependencies. Renders the tool into #converter-root.
 *
 * Preset via data attributes on #converter-root:
 *   data-tab="units" | "cooking"
 *   data-from / data-to                       (unit ids, Units tab)
 *   data-ingredient / data-ck-from / data-ck-to  (Cooking tab)
 *   data-amount
 * URL params (?tab=&from=&to=&ingredient=&ckfrom=&ckto=&amount=) override
 * the data attributes, so any conversion can be deep-linked.
 */
(function () {
  'use strict';

  /* ---------- Scroll reveal (site-wide, decorative) ----------
   * CSS only hides [data-reveal] when html.js is present, so content
   * stays visible if this script ever fails to run. */
  document.documentElement.classList.add('js');
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }
  }

  /* ---------------- Unit data ----------------
   * Linear families: `factor` converts one of the unit into the family's
   * base unit (m, kg, L, m², m/s, s, byte, J, Pa). All factors are the
   * exact international definitions where one exists.
   */
  var FAMILIES = [
    {
      id: 'length', name: 'Length', units: [
        { id: 'mm',   name: 'Millimetre',    symbol: 'mm', factor: 0.001 },
        { id: 'cm',   name: 'Centimetre',    symbol: 'cm', factor: 0.01 },
        { id: 'm',    name: 'Metre',         symbol: 'm',  factor: 1 },
        { id: 'km',   name: 'Kilometre',     symbol: 'km', factor: 1000 },
        { id: 'inch', name: 'Inch',          symbol: 'in', factor: 0.0254 },
        { id: 'foot', name: 'Foot',          symbol: 'ft', factor: 0.3048 },
        { id: 'yard', name: 'Yard',          symbol: 'yd', factor: 0.9144 },
        { id: 'mile', name: 'Mile',          symbol: 'mi', factor: 1609.344 },
        { id: 'nmi',  name: 'Nautical mile', symbol: 'NM', factor: 1852 }
      ]
    },
    {
      id: 'weight', name: 'Weight / Mass', units: [
        { id: 'mg',    name: 'Milligram',      symbol: 'mg', factor: 1e-6 },
        { id: 'g',     name: 'Gram',           symbol: 'g',  factor: 0.001 },
        { id: 'kg',    name: 'Kilogram',       symbol: 'kg', factor: 1 },
        { id: 'tonne', name: 'Tonne (metric)', symbol: 't',  factor: 1000 },
        { id: 'oz',    name: 'Ounce',          symbol: 'oz', factor: 0.028349523125 },
        { id: 'lb',    name: 'Pound',          symbol: 'lb', factor: 0.45359237 },
        { id: 'stone', name: 'Stone',          symbol: 'st', factor: 6.35029318 }
      ]
    },
    {
      id: 'volume', name: 'Volume', units: [
        { id: 'ml',     name: 'Millilitre',       symbol: 'mL',    factor: 0.001 },
        { id: 'l',      name: 'Litre',            symbol: 'L',     factor: 1 },
        { id: 'tsp',    name: 'Teaspoon (US)',    symbol: 'tsp',   factor: 0.00492892159375 },
        { id: 'tbsp',   name: 'Tablespoon (US)',  symbol: 'tbsp',  factor: 0.01478676478125 },
        { id: 'floz',   name: 'Fluid ounce (US)', symbol: 'fl oz', factor: 0.0295735295625 },
        { id: 'cup',    name: 'Cup (US)',         symbol: 'cup',   factor: 0.2365882365 },
        { id: 'pint',   name: 'Pint (US)',        symbol: 'pt',    factor: 0.473176473 },
        { id: 'quart',  name: 'Quart (US)',       symbol: 'qt',    factor: 0.946352946 },
        { id: 'gallon', name: 'Gallon (US)',      symbol: 'gal',   factor: 3.785411784 }
      ]
    },
    {
      id: 'temperature', name: 'Temperature', units: [
        { id: 'c', name: 'Celsius',    symbol: '°C' },
        { id: 'f', name: 'Fahrenheit', symbol: '°F' },
        { id: 'k', name: 'Kelvin',     symbol: 'K' }
      ]
    },
    {
      id: 'area', name: 'Area', units: [
        { id: 'sqm',  name: 'Square metre',     symbol: 'm²',  factor: 1 },
        { id: 'sqkm', name: 'Square kilometre', symbol: 'km²', factor: 1e6 },
        { id: 'ha',   name: 'Hectare',          symbol: 'ha',  factor: 10000 },
        { id: 'sqft', name: 'Square foot',      symbol: 'ft²', factor: 0.09290304 },
        { id: 'acre', name: 'Acre',             symbol: 'ac',  factor: 4046.8564224 },
        { id: 'sqmi', name: 'Square mile',      symbol: 'mi²', factor: 2589988.110336 }
      ]
    },
    {
      id: 'speed', name: 'Speed', units: [
        { id: 'kmh',  name: 'Kilometres per hour', symbol: 'km/h', factor: 1000 / 3600 },
        { id: 'mph',  name: 'Miles per hour',      symbol: 'mph',  factor: 0.44704 },
        { id: 'ms',   name: 'Metres per second',   symbol: 'm/s',  factor: 1 },
        { id: 'knot', name: 'Knots',               symbol: 'kn',   factor: 1852 / 3600 }
      ]
    },
    {
      id: 'time', name: 'Time', units: [
        { id: 'sec',  name: 'Second', symbol: 's',   factor: 1 },
        { id: 'min',  name: 'Minute', symbol: 'min', factor: 60 },
        { id: 'hour', name: 'Hour',   symbol: 'h',   factor: 3600 },
        { id: 'day',  name: 'Day',    symbol: 'd',   factor: 86400 },
        { id: 'week', name: 'Week',   symbol: 'wk',  factor: 604800 }
      ]
    },
    {
      id: 'digital', name: 'Digital storage', units: [
        { id: 'bit',  name: 'Bit',      symbol: 'bit', factor: 0.125 },
        { id: 'byte', name: 'Byte',     symbol: 'B',   factor: 1 },
        { id: 'kb',   name: 'Kilobyte', symbol: 'kB',  factor: 1e3 },
        { id: 'mb',   name: 'Megabyte', symbol: 'MB',  factor: 1e6 },
        { id: 'gb',   name: 'Gigabyte', symbol: 'GB',  factor: 1e9 },
        { id: 'tb',   name: 'Terabyte', symbol: 'TB',  factor: 1e12 }
      ]
    },
    {
      id: 'energy', name: 'Energy', units: [
        { id: 'j',    name: 'Joule',         symbol: 'J',    factor: 1 },
        { id: 'cal',  name: 'Calorie',       symbol: 'cal',  factor: 4.184 },
        { id: 'kcal', name: 'Kilocalorie',   symbol: 'kcal', factor: 4184 },
        { id: 'kwh',  name: 'Kilowatt-hour', symbol: 'kWh',  factor: 3.6e6 }
      ]
    },
    {
      id: 'pressure', name: 'Pressure', units: [
        { id: 'pa',  name: 'Pascal',     symbol: 'Pa',  factor: 1 },
        { id: 'bar', name: 'Bar',        symbol: 'bar', factor: 1e5 },
        { id: 'psi', name: 'PSI',        symbol: 'psi', factor: 6894.757293168 },
        { id: 'atm', name: 'Atmosphere', symbol: 'atm', factor: 101325 }
      ]
    }
  ];

  /* Temperature scales need an offset, not just a factor — convert via °C. */
  var TEMP = {
    c: { toC: function (v) { return v; },                  fromC: function (v) { return v; } },
    f: { toC: function (v) { return (v - 32) * 5 / 9; },   fromC: function (v) { return v * 9 / 5 + 32; } },
    k: { toC: function (v) { return v - 273.15; },         fromC: function (v) { return v + 273.15; } }
  };
  var TEMP_FORMULAS = {
    'c>f': '°F = (°C × 9⁄5) + 32',
    'f>c': '°C = (°F − 32) × 5⁄9',
    'c>k': 'K = °C + 273.15',
    'k>c': '°C = K − 273.15',
    'f>k': 'K = (°F − 32) × 5⁄9 + 273.15',
    'k>f': '°F = (K − 273.15) × 9⁄5 + 32'
  };

  /* ---------------- Cooking data ----------------
   * Kitchen convention: 1 cup = 240 mL, 1 tbsp = 15 mL, 1 tsp = 5 mL,
   * 1 fl oz = 30 mL (the rounded "US legal" kitchen units used on
   * nutrition labels and most published density charts).
   * Volume units carry `cups` (cups per unit); weight units carry `grams`.
   */
  var COOKING_UNITS = [
    { id: 'cup',  name: 'Cup (240 mL)',        symbol: 'cup',   type: 'vol', cups: 1 },
    { id: 'tbsp', name: 'Tablespoon (15 mL)',  symbol: 'tbsp',  type: 'vol', cups: 1 / 16 },
    { id: 'tsp',  name: 'Teaspoon (5 mL)',     symbol: 'tsp',   type: 'vol', cups: 1 / 48 },
    { id: 'ml',   name: 'Millilitre',          symbol: 'mL',    type: 'vol', cups: 1 / 240 },
    { id: 'l',    name: 'Litre',               symbol: 'L',     type: 'vol', cups: 1000 / 240 },
    { id: 'floz', name: 'Fluid ounce (30 mL)', symbol: 'fl oz', type: 'vol', cups: 1 / 8 },
    { id: 'g',    name: 'Gram',     symbol: 'g',  type: 'wt', grams: 1 },
    { id: 'kg',   name: 'Kilogram', symbol: 'kg', type: 'wt', grams: 1000 },
    { id: 'oz',   name: 'Ounce',    symbol: 'oz', type: 'wt', grams: 28.349523125 },
    { id: 'lb',   name: 'Pound',    symbol: 'lb', type: 'wt', grams: 453.59237 }
  ];

  /* grams per US cup (240 mL), spoon-and-level unless noted.
   * Sources: King Arthur Baking ingredient weight chart, USDA FoodData
   * Central. These are the values the cups-to-grams page table must match.
   */
  var INGREDIENTS = [
    { id: 'flour',        name: 'All-purpose / plain flour',   gramsPerCup: 120, note: 'spooned & levelled' },
    { id: 'flour-bread',  name: 'Bread flour',                 gramsPerCup: 120, note: 'spooned & levelled' },
    { id: 'flour-ww',     name: 'Wholemeal / wholewheat flour', gramsPerCup: 120, note: 'spooned & levelled' },
    { id: 'flour-cake',   name: 'Cake flour',                  gramsPerCup: 114, note: 'spooned & levelled' },
    { id: 'flour-sr',     name: 'Self-raising flour',          gramsPerCup: 120, note: 'spooned & levelled' },
    { id: 'sugar',        name: 'Granulated white sugar',      gramsPerCup: 200 },
    { id: 'sugar-caster', name: 'Caster (superfine) sugar',    gramsPerCup: 210 },
    { id: 'sugar-brown',  name: 'Brown sugar',                 gramsPerCup: 220, note: 'firmly packed' },
    { id: 'sugar-icing',  name: 'Icing / powdered sugar',      gramsPerCup: 120, note: 'unsifted' },
    { id: 'butter',       name: 'Butter',                      gramsPerCup: 227 },
    { id: 'milk',         name: 'Milk',                        gramsPerCup: 245 },
    { id: 'water',        name: 'Water',                       gramsPerCup: 240 },
    { id: 'honey',        name: 'Honey',                       gramsPerCup: 340 },
    { id: 'syrup-golden', name: 'Golden syrup',                gramsPerCup: 340 },
    { id: 'syrup-maple',  name: 'Maple syrup',                 gramsPerCup: 320 },
    { id: 'molasses',     name: 'Molasses / treacle',          gramsPerCup: 340 },
    { id: 'cocoa',        name: 'Cocoa powder (unsweetened)',  gramsPerCup: 85,  note: 'spooned & levelled' },
    { id: 'oats',         name: 'Rolled oats',                 gramsPerCup: 90,  note: 'old-fashioned' },
    { id: 'rice',         name: 'White rice',                  gramsPerCup: 185, note: 'uncooked' },
    { id: 'rice-brown',   name: 'Brown rice',                  gramsPerCup: 190, note: 'uncooked' },
    { id: 'salt',         name: 'Salt (table)',                gramsPerCup: 288 },
    { id: 'oil-olive',    name: 'Olive oil',                   gramsPerCup: 216 },
    { id: 'oil-veg',      name: 'Vegetable oil',               gramsPerCup: 218 },
    { id: 'pb',           name: 'Peanut butter',               gramsPerCup: 270 },
    { id: 'yogurt',       name: 'Yoghurt (plain)',             gramsPerCup: 245 },
    { id: 'sourcream',    name: 'Sour cream',                  gramsPerCup: 230 },
    { id: 'cream',        name: 'Heavy / thickened cream',     gramsPerCup: 238 },
    { id: 'creamcheese',  name: 'Cream cheese',                gramsPerCup: 227 },
    { id: 'cornflour',    name: 'Cornflour / cornstarch',      gramsPerCup: 128 },
    { id: 'chocchips',    name: 'Chocolate chips',             gramsPerCup: 170 },
    { id: 'coconut',      name: 'Desiccated coconut',          gramsPerCup: 85 },
    { id: 'almondmeal',   name: 'Almond meal / flour',         gramsPerCup: 96 },
    { id: 'breadcrumbs',  name: 'Breadcrumbs (dry)',           gramsPerCup: 110 },
    { id: 'parmesan',     name: 'Parmesan (finely grated)',    gramsPerCup: 100 },
    { id: 'cheddar',      name: 'Cheddar (shredded)',          gramsPerCup: 113 },
    { id: 'raisins',      name: 'Raisins / sultanas',          gramsPerCup: 150 }
  ];

  /* ---------------- Lookup maps ---------------- */
  var UNIT_MAP = {};
  FAMILIES.forEach(function (fam) {
    fam.units.forEach(function (u) { UNIT_MAP[u.id] = { unit: u, family: fam }; });
  });
  var CK_MAP = {};
  COOKING_UNITS.forEach(function (u) { CK_MAP[u.id] = u; });
  var ING_MAP = {};
  INGREDIENTS.forEach(function (i) { ING_MAP[i.id] = i; });

  /* ---------------- Conversion ---------------- */
  function convertUnits(value, fromId, toId) {
    var from = UNIT_MAP[fromId], to = UNIT_MAP[toId];
    if (!from || !to || from.family.id !== to.family.id) return NaN; // cross-family is impossible
    if (from.family.id === 'temperature') {
      return TEMP[toId].fromC(TEMP[fromId].toC(value));
    }
    return value * from.unit.factor / to.unit.factor;
  }

  function convertCooking(value, fromId, toId, ingId) {
    var from = CK_MAP[fromId], to = CK_MAP[toId], ing = ING_MAP[ingId];
    if (!from || !to || !ing) return NaN;
    var grams = from.type === 'wt' ? value * from.grams
                                   : value * from.cups * ing.gramsPerCup;
    return to.type === 'wt' ? grams / to.grams
                            : (grams / ing.gramsPerCup) / to.cups;
  }

  /* ---------------- Formatting ---------------- */
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '···';
    if (n === 0) return '0';
    var abs = Math.abs(n);
    if (abs >= 1e15 || abs < 1e-6) {
      // strip trailing zeros from the mantissa: 1.2340e+15 -> 1.234e+15
      return n.toExponential(4).replace(/\.?0+e/, 'e');
    }
    var r = Number(n.toPrecision(8));
    return r.toLocaleString('en-US', { maximumFractionDigits: 12 });
  }

  /* retrigger the result pulse animation (CSS gates it behind
     prefers-reduced-motion) */
  function pulseResult(valueEl) {
    var main = valueEl.parentElement;
    if (!main || !main.classList) return;
    main.classList.remove('pulse');
    void main.offsetWidth;
    main.classList.add('pulse');
  }

  function parseAmount(input) {
    var raw = String(input.value).trim();
    if (raw === '') return NaN;
    var v = Number(raw);
    return isFinite(v) ? v : NaN;
  }

  /* ---------------- UI ---------------- */
  var root = document.getElementById('converter-root');
  if (!root) return;

  root.innerHTML =
    '<div class="converter card">' +
      '<div class="tabs" role="tablist" aria-label="Converter mode">' +
        '<button type="button" class="tab" id="tab-units" role="tab" aria-selected="true" aria-controls="panel-units">Unit Converter</button>' +
        '<button type="button" class="tab" id="tab-cooking" role="tab" aria-selected="false" aria-controls="panel-cooking">Cooking Converter</button>' +
      '</div>' +
      '<section class="panel" id="panel-units" role="tabpanel" aria-labelledby="tab-units">' +
        '<div class="field">' +
          '<label for="uc-amount">Amount</label>' +
          '<input id="uc-amount" type="number" step="any" inputmode="decimal" value="1" autocomplete="off">' +
        '</div>' +
        '<div class="convert-row">' +
          '<div class="field"><label for="uc-from">From</label><select id="uc-from"></select></div>' +
          '<button type="button" class="swap" id="uc-swap" title="Swap units" aria-label="Swap the from and to units">⇄</button>' +
          '<div class="field"><label for="uc-to">To</label><select id="uc-to"></select></div>' +
        '</div>' +
        '<div class="result">' +
          '<div class="result-main"><span id="uc-result" aria-live="polite">···</span>' +
          '<button type="button" class="copy" id="uc-copy" title="Copy result">Copy</button></div>' +
          '<div class="result-sub" id="uc-rate"></div>' +
        '</div>' +
        '<p class="tool-note">Greyed-out units belong to a different measurement family and can’t be selected: you can’t convert millilitres to Kelvin.</p>' +
      '</section>' +
      '<section class="panel" id="panel-cooking" role="tabpanel" aria-labelledby="tab-cooking" hidden>' +
        '<div class="field">' +
          '<label for="ck-ingredient">Ingredient</label>' +
          '<select id="ck-ingredient"></select>' +
        '</div>' +
        '<div class="field">' +
          '<label for="ck-amount">Amount</label>' +
          '<input id="ck-amount" type="number" step="any" min="0" inputmode="decimal" value="1" autocomplete="off">' +
        '</div>' +
        '<div class="convert-row">' +
          '<div class="field"><label for="ck-from">From</label><select id="ck-from"></select></div>' +
          '<button type="button" class="swap" id="ck-swap" title="Swap units" aria-label="Swap the from and to units">⇄</button>' +
          '<div class="field"><label for="ck-to">To</label><select id="ck-to"></select></div>' +
        '</div>' +
        '<div class="result">' +
          '<div class="result-main"><span id="ck-result" aria-live="polite">···</span>' +
          '<button type="button" class="copy" id="ck-copy" title="Copy result">Copy</button></div>' +
          '<div class="result-sub" id="ck-density"></div>' +
        '</div>' +
        '<p class="tool-note">Volume-to-weight uses each ingredient’s real density (US cup = 240 mL, spoon-and-level), so 1 cup of flour and 1 cup of sugar give different grams.</p>' +
      '</section>' +
    '</div>';

  var $ = function (id) { return document.getElementById(id); };
  var tabUnits = $('tab-units'), tabCooking = $('tab-cooking');
  var panelUnits = $('panel-units'), panelCooking = $('panel-cooking');
  var ucAmount = $('uc-amount'), ucFrom = $('uc-from'), ucTo = $('uc-to');
  var ucSwap = $('uc-swap'), ucResult = $('uc-result'), ucRate = $('uc-rate'), ucCopy = $('uc-copy');
  var ckIng = $('ck-ingredient'), ckAmount = $('ck-amount'), ckFrom = $('ck-from'), ckTo = $('ck-to');
  var ckSwap = $('ck-swap'), ckResult = $('ck-result'), ckDensity = $('ck-density'), ckCopy = $('ck-copy');

  /* Populate the unit selects: every unit from every family, grouped. */
  function fillUnitSelect(sel) {
    FAMILIES.forEach(function (fam) {
      var og = document.createElement('optgroup');
      og.label = fam.name;
      fam.units.forEach(function (u) {
        var o = document.createElement('option');
        o.value = u.id;
        o.textContent = u.name + ' (' + u.symbol + ')';
        o.dataset.family = fam.id;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
  }
  fillUnitSelect(ucFrom);
  fillUnitSelect(ucTo);

  ['vol', 'wt'].forEach(function (type) {
    var og = document.createElement('optgroup');
    og.label = type === 'vol' ? 'Volume' : 'Weight';
    COOKING_UNITS.filter(function (u) { return u.type === type; }).forEach(function (u) {
      var o = document.createElement('option');
      o.value = u.id;
      o.textContent = u.name;
      og.appendChild(o);
    });
    ckFrom.appendChild(og);
    ckTo.appendChild(og.cloneNode(true));
  });

  INGREDIENTS.forEach(function (i) {
    var o = document.createElement('option');
    o.value = i.id;
    o.textContent = i.name;
    ckIng.appendChild(o);
  });

  /* Grey out + disable every "to" unit outside the "from" unit's family,
   * and make sure the current "to" selection is always compatible. */
  function syncToSelect() {
    var entry = UNIT_MAP[ucFrom.value];
    if (!entry) return;
    var famId = entry.family.id;
    var firstCompatible = null;
    for (var i = 0; i < ucTo.options.length; i++) {
      var opt = ucTo.options[i];
      var compatible = opt.dataset.family === famId;
      opt.disabled = !compatible;
      opt.classList.toggle('incompatible', !compatible);
      if (compatible && !firstCompatible && opt.value !== ucFrom.value) firstCompatible = opt;
    }
    var current = ucTo.options[ucTo.selectedIndex];
    if (!current || current.disabled) {
      ucTo.value = firstCompatible ? firstCompatible.value : ucFrom.value;
    }
  }

  function updateUnits() {
    var v = parseAmount(ucAmount);
    var from = UNIT_MAP[ucFrom.value], to = UNIT_MAP[ucTo.value];
    if (!from || !to) {
      ucResult.textContent = '···';
      ucRate.textContent = '';
      return;
    }
    if (isNaN(v)) {
      ucResult.textContent = '···';
      ucRate.textContent = 'Enter an amount above to convert.';
      return;
    }
    var out = convertUnits(v, ucFrom.value, ucTo.value);
    ucResult.textContent = fmt(out) + ' ' + to.unit.symbol;
    pulseResult(ucResult);
    if (from.family.id === 'temperature') {
      ucRate.textContent = ucFrom.value === ucTo.value
        ? fmt(v) + ' ' + from.unit.symbol + ' = ' + fmt(out) + ' ' + to.unit.symbol
        : TEMP_FORMULAS[ucFrom.value + '>' + ucTo.value];
    } else {
      ucRate.textContent = '1 ' + from.unit.symbol + ' = ' + fmt(convertUnits(1, ucFrom.value, ucTo.value)) + ' ' + to.unit.symbol;
    }
  }

  function updateCooking() {
    var v = parseAmount(ckAmount);
    var ing = ING_MAP[ckIng.value], from = CK_MAP[ckFrom.value], to = CK_MAP[ckTo.value];
    if (!ing || !from || !to) {
      ckResult.textContent = '···';
      ckDensity.textContent = '';
      return;
    }
    var densityLine = 'Density: 1 cup ≈ ' + ing.gramsPerCup + ' g' +
      (ing.note ? ' (' + ing.note + ')' : '');
    if (isNaN(v) || v < 0) {
      ckResult.textContent = '···';
      ckDensity.textContent = densityLine;
      return;
    }
    var out = convertCooking(v, ckFrom.value, ckTo.value, ckIng.value);
    ckResult.textContent = fmt(out) + ' ' + to.symbol;
    pulseResult(ckResult);
    ckDensity.textContent = fmt(v) + ' ' + from.symbol + ' of ' + ing.name.toLowerCase() +
      ' = ' + fmt(out) + ' ' + to.symbol + ' · ' + densityLine;
  }

  function selectTab(which) {
    var cooking = which === 'cooking';
    tabUnits.setAttribute('aria-selected', String(!cooking));
    tabCooking.setAttribute('aria-selected', String(cooking));
    tabUnits.tabIndex = cooking ? -1 : 0;
    tabCooking.tabIndex = cooking ? 0 : -1;
    panelUnits.hidden = cooking;
    panelCooking.hidden = !cooking;
  }

  function copyHandler(btn, getText) {
    if (!(navigator.clipboard && navigator.clipboard.writeText)) {
      btn.hidden = true; // no silent dead button on non-secure contexts
      return;
    }
    btn.addEventListener('click', function () {
      var flash = function (msg) {
        btn.textContent = msg;
        setTimeout(function () { btn.textContent = 'Copy'; }, 1300);
      };
      navigator.clipboard.writeText(getText()).then(
        function () { flash('Copied ✓'); },
        function () { flash('Copy failed'); }
      );
    });
  }

  /* ---------------- Events ---------------- */
  tabUnits.addEventListener('click', function () { selectTab('units'); });
  tabCooking.addEventListener('click', function () { selectTab('cooking'); });
  root.querySelector('.tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var cookingSelected = tabCooking.getAttribute('aria-selected') === 'true';
    selectTab(cookingSelected ? 'units' : 'cooking');
    (cookingSelected ? tabUnits : tabCooking).focus();
    e.preventDefault();
  });

  ucAmount.addEventListener('input', updateUnits);
  ucFrom.addEventListener('change', function () { syncToSelect(); updateUnits(); });
  ucTo.addEventListener('change', updateUnits);
  ucSwap.addEventListener('click', function () {
    var a = ucFrom.value;
    ucFrom.value = ucTo.value;
    ucTo.value = a;
    syncToSelect();
    updateUnits();
  });

  ckAmount.addEventListener('input', updateCooking);
  ckIng.addEventListener('change', updateCooking);
  ckFrom.addEventListener('change', updateCooking);
  ckTo.addEventListener('change', updateCooking);
  ckSwap.addEventListener('click', function () {
    var a = ckFrom.value;
    ckFrom.value = ckTo.value;
    ckTo.value = a;
    updateCooking();
  });

  copyHandler(ucCopy, function () {
    return fmt(parseAmount(ucAmount)) + ' ' + UNIT_MAP[ucFrom.value].unit.symbol +
           ' = ' + ucResult.textContent;
  });
  copyHandler(ckCopy, function () {
    return fmt(parseAmount(ckAmount)) + ' ' + CK_MAP[ckFrom.value].symbol +
           ' of ' + ING_MAP[ckIng.value].name + ' = ' + ckResult.textContent;
  });

  /* ---------------- Preset (data attributes + URL params) ---------------- */
  var params = new URLSearchParams(location.search);
  // hasOwnProperty guard: inherited keys ("constructor", "toString", …) must
  // not pass validation, and an invalid URL param must not shadow a valid
  // data-attribute preset — each source is validated independently.
  function pick(param, dataKey, fallback, map) {
    var fromUrl = params.get(param);
    if (fromUrl && Object.prototype.hasOwnProperty.call(map, fromUrl)) return fromUrl;
    var fromData = root.dataset[dataKey];
    if (fromData && Object.prototype.hasOwnProperty.call(map, fromData)) return fromData;
    return fallback;
  }
  var tab = params.get('tab') || root.dataset.tab || 'units';
  ucFrom.value = pick('from', 'from', 'cm', UNIT_MAP);
  ucTo.value = pick('to', 'to', 'inch', UNIT_MAP);
  ckIng.value = pick('ingredient', 'ingredient', 'flour', ING_MAP);
  ckFrom.value = pick('ckfrom', 'ckFrom', 'cup', CK_MAP);
  ckTo.value = pick('ckto', 'ckTo', 'g', CK_MAP);
  var presetAmount = Number(params.get('amount') || root.dataset.amount);
  if (presetAmount && isFinite(presetAmount)) {
    // assign the normalized string: "0x10" or "+5" pass Number() but would be
    // rejected (blanked) by the number input's valid-float parsing
    ucAmount.value = String(presetAmount);
    ckAmount.value = String(presetAmount);
  }
  selectTab(tab === 'cooking' ? 'cooking' : 'units');
  syncToSelect();
  updateUnits();
  updateCooking();
})();

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend, create as svgCreate } from 'tiny-svg';

const HIGH_PRIORITY = 1500;

export default class BpmnJsMonitoring extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, canvas) {
    super(eventBus, HIGH_PRIORITY);
    this.eventBus = eventBus;
    this.bpmnRenderer = bpmnRenderer;
    this.canvas = canvas;
    this._stats = {};
    this._minValue = 0;
    this._maxValue = 0;
    this.mode = 'count'; // Default mode is 'count'
  }

  setStats(stats) {
    this._stats = stats;
    this._updateMinMaxValues();
    this._updateDiagram();
  }

  setMode(mode) {
    this.mode = mode;
    this._updateMinMaxValues();
    this._updateDiagram();
  }

  _updateMinMaxValues() {
    const values = Object.values(this._stats)
      .map(stat => stat[this.mode])
      .filter(value => value !== undefined);
    if (values.length > 0) {
      this._minValue = Math.min(...values);
      this._maxValue = Math.max(...values);
    } else {
      this._minValue = 0;
      this._maxValue = 0;
    }
  }

  _updateDiagram() {
    const allElements = this._getAllElements();
    this.eventBus.fire('elements.changed', { elements: allElements });
  }

  _getAllElements() {
    const elements = [];
    const rootElements = this.canvas.getRootElement().children;

    function collectElements(element) {
      elements.push(element);
      if (element.children) {
        element.children.forEach(collectElements);
      }
    }

    rootElements.forEach(collectElements);
    return elements;
  }

  canRender(element) {
    return true;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    if (this._stats[element.id]) {
      const value = this._stats[element.id][this.mode];
      if (value !== undefined) {
        const label = this.mode.includes('_minutes') ? this._formatTime(value) : value;
        this.addFill(parentNode, element, value);
        this.addCustomLabel(parentNode, element, label);
      }
    }
    return shape;
  }

  drawConnection(parentNode, element) {
    const connection = this.bpmnRenderer.drawConnection(parentNode, element);
    if (this._stats[element.id]) {
      const value = this._stats[element.id][this.mode];
      if (value !== undefined) {
        const label = this.mode.includes('_minutes') ? this._formatTime(value) : value;
        this.addGlow(parentNode, element, value);
        this.addConnectionLabel(parentNode, element, label);
      }
    }
    return connection;
  }

  addCustomLabel(parentNode, element, label) {
    const { width } = element;
    const textContent = label.toString();
    const textWidth = textContent.length * 8;
    const textRectWidth = textWidth + 10;
    const textRectX = width - textRectWidth / 2;

    const group = svgCreate('g');

    const fillColor = this.getColor(label);
    const textColor = this.getContrastingColor(fillColor);

    const textRect = svgCreate('rect', {
      x: textRectX,
      y: -10,
      width: textRectWidth,
      height: 13,
      stroke: 'black',
      'stroke-width': 1,
      fill: fillColor
    });

    const text = svgCreate('text', {
      x: textRectX + 5,
      y: 0,
      fill: textColor,
      'font-size': '10px'
    });

    text.textContent = textContent;

    svgAppend(group, textRect);
    svgAppend(group, text);
    svgAppend(parentNode, group);
  }

  addConnectionLabel(parentNode, element, label) {
    
    if ([null, undefined, ''].includes(label)) {
      return;
    }
    const waypoints = element.waypoints;

    const midpoints = waypoints.map((point, index) => {
      if (index === waypoints.length - 1) return null;
      const nextPoint = waypoints[index + 1];
      return {
        x: (point.x + nextPoint.x) / 2,
        y: (point.y + nextPoint.y) / 2
      };
    }).filter(Boolean);

    const midpoint = midpoints[Math.floor(midpoints.length / 2)];

    const textContent = label.toString();
    const textWidth = textContent.length * 8;
    const textRectWidth = textWidth + 10;
    const textRectX = midpoint.x - textRectWidth / 2;
    const textRectY = midpoint.y - 10;

    const group = svgCreate('g');

    const fillColor = this.getColor(label);
    const textColor = this.getContrastingColor(fillColor);

    const textRect = svgCreate('rect', {
      x: textRectX,
      y: textRectY,
      width: textRectWidth,
      height: 13,
      stroke: 'black',
      'stroke-width': 1,
      fill: fillColor
    });

    const text = svgCreate('text', {
      x: textRectX + 5,
      y: textRectY + 10,
      fill: textColor,
      'font-size': '10px'
    });

    text.textContent = textContent;

    svgAppend(group, textRect);
    svgAppend(group, text);
    svgAppend(parentNode, group);
  }

  addGlow(parentNode, element, value) {
    if ([null, undefined].includes(value)) {
      return;
    }
    const waypoints = element.waypoints;
    const pathData = waypoints.map((point, index) => {
      return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
    }).join(' ');

    const glowThickness = this.getGlowThickness(value);
    const glowColor = this.getColor(value, 0.5);
    const glow = svgCreate('path', {
      d: pathData,
      stroke: glowColor,
      'stroke-width': glowThickness,
      fill: 'none'
    });

    svgAppend(parentNode, glow);
    parentNode.insertBefore(glow, parentNode.firstChild);
  }

  addFill(parentNode, element, value) {
    if ([null, undefined].includes(value)) {
      return;
    }
    const fillColor = this.getColor(value, 0.5);
    const rect = parentNode.querySelector('rect, ellipse, polygon, circle, path');
    if (rect) {
      rect.style.fill = fillColor;
    }
  }

  getGlowThickness(value) {
    const ratio = (value - this._minValue) / ((this._maxValue - this._minValue) || 1);
    const minThickness = 10;
    const maxThickness = 40;
    return minThickness + ratio * (maxThickness - minThickness);
  }

  getColor(value, opacity = 1) {
    if (typeof value === 'string') {
      value = this._parseTime(value);
    }
    const ratio = (value - this._minValue) / ((this._maxValue - this._minValue) || 1);
    const red = Math.floor(255 * ratio);
    const green = Math.floor(255 * (1 - ratio));
    return `rgb(${red},${green},0,${opacity})`;
  }

  _parseTime(timeStr) {
    const timeUnits = { d: 1440, h: 60, m: 1 };
    return timeStr.split(' ').reduce((total, part) => {
      const unit = part.slice(-1);
      const value = parseInt(part.slice(0, -1), 10);
      return total + value * timeUnits[unit];
    }, 0);
  }

  getContrastingColor(rgb) {
    const [ r, g, b ] = rgb.match(/\d+/g).map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  }

  getShapePath(shape) {
    return this.bpmnRenderer.getShapePath(shape);
  }

  _formatTime(minutes) {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    const result = [];
    if (days > 0) result.push(`${days}d`);
    if (hours > 0) result.push(`${hours}h`);
    if (mins > 0) result.push(`${mins}m`);
    return result.join(' ');
  }
}

BpmnJsMonitoring.$inject = [ 'eventBus', 'bpmnRenderer', 'canvas' ];

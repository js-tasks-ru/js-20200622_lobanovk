import fetchJson from './utils/fetch-json';

const BACKEND_URL = 'https://course-js.javascript.ru';
export default class ColumnChart {
  element = null;
	subElements = {};
	chartHeight = 50;

  constructor ({
		label = '',
    formatHeading= data => data,
    link = null, 
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
	} = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.loadData(this.range.from, this.range.to);
  }

  async loadData(from, to) {
    this.element.classList.add('column-chart_loading');
    this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    this.setNewRange(from, to);

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnBody(data);

      this.element.classList.remove('column-chart_loading');
    }
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

	getColumnBody (data) {
		const maxValue = Math.max(...Object.values(data));

    return Object.entries(data).map(([key, value]) => {
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);
      const tooltip = `<span>
        <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
        <br>
        <strong>${percent}%</strong>
      </span>`;

      return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`;
    }).join('');
	}

	getLink() {
		return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
	}

	get template() {
		return `
			<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
				<div class="column-chart__title">
					Total ${this.label}
					${this.getLink()}
				</div>
				<div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
				</div>
			</div>
		`;
	}


  render () {
		const element = document.createElement('div');

		element.innerHTML = this.template;

		this.element = element.firstElementChild;
		this.subElements = this.getSubElements(this.element);
	}

	getSubElements (element) {
		const elements = element.querySelectorAll('[data-element]');
		return [...elements].reduce((acc, subElement) => {
			acc[subElement.dataset.element] = subElement;

			return acc;
		}, {});
	}

  async update(from, to) {
    return await this.loadData(from, to);
  }
	
	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.subElements = {};
	}
}

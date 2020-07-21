export default class SortableTable {
  element;
  subElements = {};

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toogleOrders = order => {
      const orders = {
        asc: 'asc',
        desc: 'desc',
      };

      return orders[order];
    }

    if (column) {
      const { id, order } = column.dataset;
      const { body } = this.subElements;
      const sortedData = this.sort(id, toogleOrders(order));
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = order === 'asc' ? 'desc' : 'asc';

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      body.innerHTML = this.getTableRows(sortedData);
    }
  }

  constructor(header, {
    data = [],
    sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc',
    }
  } = {}) {
    this.header = header;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }

  getTableHeader() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.header.map(item => this.getHeaderRow(item)).join('')}
    </div>
    `
  }

  getHeaderRow(item) {
    const { id, title, sortable } = item;
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
    <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
      <span>${title}</span>
      ${this.getHeaderSortingArrow(id)}
    </div>
    `
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist ? `
    <span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
    </span>
    ` : '';
  }

  getTableBody(data) {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this.getTableRows(data)}
    </div>
    `
  }

  getTableRows(data) {
    
    return data.map(item => `
    <a href="${item.link ? item.link : '#'}" class="sortable-table__row">
      ${this.getTableRow(item)}
    </a>
    `).join('');
  }

  getTableRow(item) {
    const cells = this.header.map(({id, template}) => ({id, template}));

    return cells.map(({id, template}) => {
      return template ? template(item[id]) :
        `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  getTable(data) {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>
    </div>
    `
  } 

  initEventListeners() {
    const { header } = this.subElements;

    header.addEventListener('pointerdown', this.onSortClick);
  }

  render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement('div');
    const sortedData = this.sort(id, order);

    wrapper.innerHTML = this.getTable(sortedData);

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
  }

  sort(field, order) {
    const sortData = [...this.data];
    const column = this.header.find(item => item.id === field);
    const { sortType } = column;  
    const direction = order === 'asc' ? 1 : -1;

    return sortData.sort((firstItem, secondItem) => {
      switch (sortType) {
        case 'number':
          return direction * (firstItem[field] - secondItem[field]);
        case 'string':
          return direction * firstItem[field].localeCompare(secondItem[field], 'ru', {usage: 'sort', caseFirst : "upper"});
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements (element) {
		const elements = element.querySelectorAll('[data-element]');
		return [...elements].reduce((acc, subElement) => {
			acc[subElement.dataset.element] = subElement;

			return acc;
		}, {});
	}

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

}

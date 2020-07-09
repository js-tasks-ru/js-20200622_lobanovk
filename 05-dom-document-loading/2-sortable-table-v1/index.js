export default class SortableTable {
  element = null;
  subElements = null;
  templateFunc = {};

  constructor(header = [], { data = [] } = {}) {
    this.header = header;
    this.data = data;

    this.render();
  }

  get templateHeader () {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getRowHeader(this.header)}
      </div>
    `
  }

  get templateBodyTable() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getRowBody(this.data)}
      </div>
    `
  }

  set templateBodyTable(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getRowBody(data)}
      </div>
    `
  }

  getRowHeader(data) {
    return data.map(item => {
      if (item.template) {
        this.templateFunc[item.id] = item.template
      }
      return `
      <div class="sortable-table__cell" data-name="${item.id}" ${item.sortable ? 'data-sortable=""' : ''}>
        <span>${item.title}</span>
      </div>
      `
    }).join('');
  }

  

  getRowBody (data) {
    const columnDictionary = this.header.map(item => item.id);
    const productsInformation = data.map(item => {
      return columnDictionary.reduce((acc, prop) => {
        if (item[prop]) {
          acc[prop] = item[prop]
        }
        return acc;
      }, {})
    });

    return productsInformation.map(item => `
      <a href="${item.link ? item.link : ''}" class="sortable-table__row">
        ${
          columnDictionary.map(prop => {
            if (this.templateFunc[prop]) {
              return this.templateFunc[prop](item[prop]);
            }
            return `
              <div class="sortable-table__cell">${item[prop]}</div>
            `
          }).join('')
        }     
      </a>
    `).join('')
  }


  render() {
    const element = document.createElement('div');

    const content = `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${this.templateHeader}
        ${this.templateBodyTable}
      </div>
    </div>
    `
    element.innerHTML = content;

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

  sort(field, order) {
    const sortData = [...this.data];
    
    const sortType = this.header.find(item => item.id === field).sortType;
    const data = sortData.sort((firstItem, secondItem) => {
      let result;
      if (sortType === 'string') {
        result = firstItem[field].localeCompare(secondItem[field], 'ru', {usage: 'sort', caseFirst : "upper"});
      } else {
        if (firstItem[field] > secondItem[field]) {
          result = 1
        } else if (firstItem[field] < secondItem[field]) {
          result = -1;
        } else {
          result = 0;
        }
      }

      return order === 'asc' ? result : result * -1;
    })

    this.subElements.body.innerHTML = this.getRowBody(data);
  }

  remove() {
    this.element.remove();
    this.dictionaryColumn = {};
    this.templateFunc = {};
  }

  destroy() {
    this.remove();
  }
}


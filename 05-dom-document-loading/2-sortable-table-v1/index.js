export default class SortableTable {
  element = null;

  constructor(header = [], { data = [] } = {}) {
    thos.header = header;
    this.data = data;

    this.render();
  }

  get templateHeader () {

  }

  get templateBodyTable() {

  }

  getRowBody () {
    
  }

  render() {

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}


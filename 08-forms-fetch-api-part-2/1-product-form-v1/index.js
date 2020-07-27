import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  subActionElements = {};
  product;
  categories;
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  async onLoadCategories() {
    this.urlCategories.searchParams.set('_sort', 'weight');
    this.urlCategories.searchParams.set('_refs', 'subcategory');

    return await fetchJson(this.urlCategories);
  }

  async onLoadInfoAboutProduct(productId) {
    this.urlProduct.searchParams.set('id', productId);

    return await fetchJson(this.urlProduct);

  }

  constructor(productId = '', url = '') {
    this.productId = productId;

    this.urlCategories = new URL('api/rest/categories', BACKEND_URL);
    this.urlProduct = new URL('api/rest/products', BACKEND_URL);
  }

  getTitleProduct() {
    return `
    <div class="form-group form-group__half_left">
      <fieldset>
        <label class="form-label">Название товара</label>
        <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
      </fieldset>
    </div>
    `
  }

  getDescriptionProduct() {
    return `
    <div class="form-group form-group__wide">
      <label class="form-label">Описание</label>
      <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
    </div>
    `
  }

  getImagesProduct(images = []) {
    return `
    <div class="form-group form-group__wide" data-element="sortable-list-container">
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer">
        ${this.getImageListContainer(images)}
      </div>
      <button type="button" id="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
    </div>
    `
  }

  getImageListContainer(images) {
    return `
      <ul class="sortable-list">
        ${images.length ? images.map(image => this.getImageRow(image)).join('') : ''}
      </ul>
    `
  }

  getImageRow(image) {
    const { source, url} = image;
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `
  }

  getCategoriesProduct(categories = []) {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">
          ${this.getOptions(categories)}
        </select>
      </div>
    `
  }

  getOptions(categories) {

    const getSelectedOption = (product, id) => {
      if (!product) return '';
      if (product.subcategory === id) return 'selected';
      return '';
    }

    return categories.map(category => {
      const { title: titleCategory, subcategories } = category;
      return subcategories.map(({id, title}) => `<option ${getSelectedOption(this.product, id)} value="${id}">${titleCategory} > ${title}</option>`).join('');
    }).join('');
  }

  getPriceAndDiscount() {
    return `
    <div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        <label class="form-label">Цена ($)</label>
        <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
      </fieldset>
    </div>
    `
  }

  getCountProduct() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
      </div>
    `
  }

  getStatusProduct(status = 1) {
    // подумать над selected
    return `
    <div class="form-group form-group__part-half">
      <label class="form-label">Статус</label>
      <select class="form-control" id="status" name="status">
        <option ${status === 1 ? 'selected' : ''} value="1">Активен</option>
        <option ${status === 0 ? 'selected' : ''} value="0">Неактивен</option>
      </select>
    </div>
    `
  }

  getSaveProduct() {
    return `      
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    `
  }

  getProductForm(categories) {
    return `
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
            ${this.getTitleProduct()}
            ${this.getDescriptionProduct()}
            ${this.getImagesProduct()}
            ${this.getCategoriesProduct(categories)}
            ${this.getPriceAndDiscount()}
            ${this.getCountProduct()}
            ${this.getStatusProduct()}
            ${this.getSaveProduct()}
        </div>
      </form>
    `
  }

  async render() {
    const categoriesPromise = this.onLoadCategories();
    const productPromise = this.productId ? this.onLoadInfoAboutProduct(this.productId) 
                                          : Promise.resolve([this.defaultFormData]);

    const [caregoriesData, productData] = await Promise.all([categoriesPromise, productPromise]);


    this.categories = caregoriesData;

    this.renderForm();
    this.initEventListeners();

    // if (caregoriesData && caregoriesData.length) {
    //   const { subcategory } = this.subActionElements;
    //   subcategory.innerHTML = this.getOptions(caregoriesData)
    // }
    if (productData) {
      this.product = productData[0];
      for (const prop in this.subActionElements) {
        this.subActionElements[prop].value = this.product[prop];
      }
      this.subElements.imageListContainer.innerHTML = this.getImageListContainer(this.product.images);
    }

    return this.element;
  }

  renderForm() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('.product-form');
    wrapper.innerHTML = this.getProductForm(this.categories);

    this.element = wrapper;
    this.subElements = this.getSubElements(wrapper);
    this.subActionElements = this.getSubActionElements(wrapper);
  }

  onUploadImage = (event) => {
    const uploadFileHTMLElement = document.createElement('input');
    uploadFileHTMLElement.setAttribute('type', 'file');
    uploadFileHTMLElement.click()
    uploadFileHTMLElement.onchange = async () => {
      try {
        const result = await this.upload(uploadFileHTMLElement.files[0]);
        const type = result.data.type.split('/').pop();
        const newImageList = this.product.images.concat({
          url: result.data.link,
          source: `${result.data.id}.${type}`
        })
        this.product.images = newImageList;
        this.subElements.imageListContainer.innerHTML = this.getImageListContainer(newImageList)
      } catch (error) {
        console.error('error', error)
      }
    };
  }

  async upload(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      return await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers:             {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
      });
    } catch (error) {
      console.error('error', error);
    }
  } 

  saveProductInfo = async (event) => {
    event.preventDefault();
    const { title, description, discount, price, quantity, status, subcategory  } = this.subActionElements;
    const body = {
      images: this.product ? this.product.images : [],
      title: title.value,
      description: description.value,
      discount: parseInt(discount.value, 10),
      price: parseInt(price.value, 10),
      quantity: parseInt(quantity.value, 10),
      status: parseInt(status.value, 10),
      subcategory: subcategory.value,
    }
    if (this.productId) {
      body.id = this.productId
    } 
    return this.save(body)
  }

  async save(body) {

    const method = this.productId ? "PUT" : "PATCH"

    const response = await fetchJson(new URL('api/rest/products', BACKEND_URL), {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })

    if (response) {
      this.productId ? this.updateDispatchEvent() : this.saveDispatchEvent() 
    }
  }

  updateDispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('product-updated', {
      detail: "Товар обновлен",
      bubbles: true
    }))
  }

  saveDispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('product-saved', {
      detail: "Товар создан",
      bubbles: true
    }))
  }

  initEventListeners() {
    const { uploadImage, save } = this.subActionElements;
    uploadImage.addEventListener('click', this.onUploadImage);
    save.addEventListener('click', this.saveProductInfo);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getSubActionElements(element) {
    const elements = element.querySelectorAll('[name]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.name] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    const { uploadImage, save } = this.subActionElements;
    uploadImage.removeEventListener('click', this.onUploadImage);
    save.removeEventListener('click', this.saveProductInfo);
    this.remove();
    this.subElements = {};
    this.subActionElements = {};
  }

}

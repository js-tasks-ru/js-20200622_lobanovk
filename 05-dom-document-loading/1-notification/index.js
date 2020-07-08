export default class NotificationMessage {
  defaultDuration = 20000;
  element = null;
  static visible = false;

  constructor(message = '', {
    duration = this.duration,
    type = 'success',
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.element = this.template;
  }


  get template() {
    const time = this.duration / 1000;

    const element = document.createElement('div');
    element.setAttribute('class', `notification ${this.type}`);
    element.setAttribute('style', `--value:${time}s`);

    const content = `
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    `

    element.innerHTML = content;

    return element;
  }

  

  show(node) {    
    if (!NotificationMessage.visible) {
      NotificationMessage.visible = true;
      
      node ? 
        node.append(this.element) :
        document.body.append(this.element);

      setTimeout(() => this.remove(), this.duration)
    }
  }

  remove() {
    this.element.remove();
    NotificationMessage.visible = false;
  }

  destroy() {
		this.remove();
	}
}

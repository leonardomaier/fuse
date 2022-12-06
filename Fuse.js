class FuseDOMComponent {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(container) {
    const domElement = document.createElement(this._currentElement.type);
    const text = this._currentElement.props.children;
    const textNode = document.createTextNode(text)

    domElement.appendChild(textNode);

    container.appendChild(domElement);

    this._hostNode = domElement;

    return domElement;
  }
}

class FuseCompositeComponentWrapper {
  constructor(element) {
    this._currentElement = element;
  } 

  mountComponent(container) {
    const Component = this._currentElement.type;
    const componentInstance = new Component(this._currentElement.props)

    let element = componentInstance.render();

    while (typeof element.type === 'function') {
      element = (new element.type(element.props)).render();
    }

    const domComponentInstance = new FuseDOMComponent(element);
    
    return domComponentInstance.mountComponent(container);
  }
}

const TopLevelWrapper = function(props) {
  this.props = props;
}

TopLevelWrapper.prototype.render = function() {
  return this.props;
}

const Fuse = {
  createClass(spec) {
    function Constructor(props) {
      this.props = props;
    }

    Constructor.prototype.render = spec.render;

    return Constructor;
  },
  createElement(type, props, children) {
    const element = {
      type,
      props: props || {}
    };

    if (children) {
      element.props.children = children;
    }

    return element;
  },
  render(element, container) {
    const wrapperElement = this.createElement(TopLevelWrapper, element);
    const componentInstance = new FuseCompositeComponentWrapper(wrapperElement);
    return componentInstance.mountComponent(container);
  }
}

const MyTitle = Fuse.createClass({
  render() {
    if (this.props.asTitle) {
      return Fuse.createElement(MyTitle, { message: 'Hey there Fuse' });
    } else {
      return Fuse.createElement('h1', null, this.props.message);
    }
  }
});

Fuse.render(
  Fuse.createElement(MyTitle, { message: 'Hey there Fuse', asTitle: true }),
  document.getElementById('root')
);
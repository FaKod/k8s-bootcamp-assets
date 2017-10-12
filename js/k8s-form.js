(function () {
  const parser = new DOMParser()

  function serialize(formData) {
    return [...formData.entries()]
      .map(e => `${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`)
      .join('&')
  }

  function splitSelectors(selctorStr) {
    return selctorStr.split(',').map(t => t.trim());
  }

  function replaceTargets(current, remote, selectors) {
    console.log(selectors)
    selectors.forEach(selector => {
      let source = current.querySelector(selector);
      if (source) {
        let target = remote.querySelector(selector);
        source.parentNode.replaceChild(target, source);
      }
    });
  }

  async function fetchDocument($form) {
    const serializedFormData = serialize(new FormData($form))
    let options = {
      method: $form.method.toUpperCase()
    }

    switch (options.method) {
      case 'POST': 
        uri = $form.action || location.pathname,
        Object.assign(options, {
          body: serializedFormData,
          headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
        })
        break;
      default:
        uri = `${$form.action}?${serializedFormData}`
    }

    try {
      const rs = await fetch(uri, options);
      const htmlString = await rs.text();
      return parser.parseFromString(htmlString, 'text/html')
    } catch (e) {
      e.message = `Failed to fetch document from ${uri}`
      throw e
    }
  }

  function createOnSubmit($form, selectors) {
    return async event => {
      event.preventDefault()
      const $doc = await fetchDocument($form)
      replaceTargets(document, $doc, selectors)
    }
  }

  class K8sForm extends HTMLElement {
    static get is() {
      return 'k8s-form'
    }

    static get observedAttributes() {
      return [
        'data-target'
      ]
    }

    attributeChangedCallback(attr, _, value) {
      this[attr] = value;
    }

    connectedCallback() {
      let targets = splitSelectors(this['data-target'])
      let $form = this.querySelector('form')

      $form.addEventListener('submit', createOnSubmit($form, targets))
    }
  }

  window.customElements.define(K8sForm.is, K8sForm)
}());
window.addEventListener('popstate', function (e) {
  if (e.state && e.state.embedded) {
    const {uri, selectors} = e.state
    updateDocument(uri, selectors)
  }
})

window.addEventListener("load", function(event) {
  const $a = document.querySelector(`a[href="${document.location.pathname}"]`)
  history.replaceState({
    embedded: true,
    uri: location.pathname
  }, null, location.pathname)
});

const parser = new DOMParser();

function splitSelectors(selctorStr) {
  return selctorStr.split(',').map(t => t.trim());
}

async function fetchDocument(uri) {
  try {
    const rs = await fetch(uri);
    const htmlString = await rs.text();
    return parser.parseFromString(htmlString, 'text/html')
  } catch (e) {
    e.message = `Failed to fetch document from ${uri}`
    throw e
  }
}

function replaceTargets(current, remote, selectors) {
  selectors.forEach(selector => {
    let source = current.querySelector(selector);
    if (source) {
      let target = remote.querySelector(selector);
      source.parentNode.replaceChild(target, source);
    }
  });
}

async function updateDocument(uri, selectors = ['body']) {
  const $doc = await fetchDocument(uri);
  replaceTargets(document, $doc, selectors)
}

class K8sLink extends HTMLElement {
  static get is() {
    return 'k8s-link'
  }

  static get observedAttributes() {
    return [
      'data-target'
    ]
  }

  attributeChangedCallback(attr, _, value) {
    this[attr] = value;
  }

  async connectedCallback() {
    const selectors = splitSelectors(this['data-target'])
    const $a = this.querySelector('a[href]')
    const uri = $a.href
    $a.addEventListener('click', async e => {
      e.preventDefault()
      history.pushState({embedded: true, uri, selectors}, null, uri)
      updateDocument(uri, selectors)
    })
  }
}

customElements.define(K8sLink.is, K8sLink)
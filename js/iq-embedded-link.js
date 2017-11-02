const parser = new DOMParser()

export default class IqEmbeddedLink extends HTMLElement {
  async fetchDocument (uri) {
    let response = await fetch(uri)
    if (response.ok) {
      let htmlString = await response.text()
      return parser.parseFromString(htmlString, 'text/html')
    }
    return null
  }

  async connectedCallback () {
    let $a = this.querySelector('a')
    let selector = this.getAttribute('data-target')
    let $remoteDocument = await this.fetchDocument($a.href)

    if ($remoteDocument) {
      let $target = $remoteDocument.querySelector(selector)
      $a.setAttribute('hidden', '')
      this.appendChild($target)
    } else {
      $a.classList.add('link--unreachable')
    }
  }
}

window.customElements.define('iq-embedded-link', IqEmbeddedLink)
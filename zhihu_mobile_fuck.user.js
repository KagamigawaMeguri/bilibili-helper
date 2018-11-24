// ==UserScript==
// @name         Fuck ZhiHu Mobile
// @namespace    https://github.com/ipcjs
// @version      1.0.1
// @description  日他娘的逼乎手机网页版
// @author       ipcjs
// @match        https://www.zhihu.com/*
// @grant        GM_addStyle
// @require      https://greasyfork.org/scripts/373283-ipcjs-lib-js/code/ipcjslibjs.js?version=647820
// ==/UserScript==

ipcjs.installInto(({ log, html, $ }) => {
    log = GM_info.script.name.endsWith('.dev') ? log : () => { }
    GM_addStyle(`
    .DownloadGuide {
        display: none;
    }
    .OpenInAppButton {
        display: none;
    }
    .MobileAppHeader-downloadLink {
        display: none;
    }
    /*
    button.ContentItem-more {
        position: absolute;
    }
    */
    `)

    installToContent(document)

    new MutationObserver((mutations, observer) => {
        for (let m of mutations) {
            for (let node of m.addedNodes) {
                installToContent(node)
            }
        }
    }).observe(document.body, {
        childList: true,
        subtree: true
    })


    function installToContent(node) {
        if (!node.querySelectorAll) {
            return
        }
        const contentItems = node.querySelectorAll('.RichContent')
        const collapseButtonHtml = '<button data-zop-retract-question="true" type="button" class="Button ContentItem-action ContentItem-rightButton Button--plain"><span class="RichContent-collapsedText">收起</span><span style="display: inline-flex; align-items: center;">​<svg class="Zi Zi--ArrowDown ContentItem-arrowIcon is-active" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M12 13L8.285 9.218a.758.758 0 0 0-1.064 0 .738.738 0 0 0 0 1.052l4.249 4.512a.758.758 0 0 0 1.064 0l4.246-4.512a.738.738 0 0 0 0-1.052.757.757 0 0 0-1.063 0L12.002 13z" fill-rule="evenodd"></path></svg></span></button>'
        if (contentItems.length > 0) {
            log('install', contentItems)
        }
        contentItems.forEach((content, index) => {
            const contentInner = content.querySelector('.RichContent-inner')
            const actions = content.querySelector('.ContentItem-actions')
            const expandButtonOuter = content.querySelector(':scope > button')
            const expandButtonInner = contentInner.querySelector(':scope > button')

            const $content = $(content)

            let diff = {
                expandButton: expandButtonOuter,
                expandButtonText: '展开阅读全文',
                onClick: function toggleContent() {
                    let collapseButton = actions.querySelector('button.Button.ContentItem-rightButton')
                    if ($content.hasClass('is-collapsed')) {
                        $content.removeClass('is-collapsed')
                        contentInner.style.maxHeight = ''
                        diff.expandButton.style.display = 'none'
                        collapseButton = html(collapseButtonHtml)[0]
                        collapseButton.addEventListener('click', toggleContent)
                        actions.appendChild(collapseButton)
                    } else {
                        $content.addClass('is-collapsed')
                        contentInner.style.maxHeight = '400px'
                        diff.expandButton.style.display = 'inline'
                        actions.removeChild(collapseButton)
                    }
                },
                onEach: () => { }
            }
            if (!expandButtonOuter && expandButtonInner) {
                diff = {
                    expandButton: expandButtonInner,
                    expandButtonText: '详细',
                    onClick: function gotoDetail() {
                        const urlMeta = content.parentElement.querySelector(':scope > meta[itemprop=url]')
                        location.href = urlMeta.content
                    },
                    onEach: function () {
                        $content.removeClass('is-collapsed')
                    }
                }
            }

            diff.onEach()
            if (diff.expandButton.innerText.startsWith('App 内查看')) {
                diff.expandButton.innerText = diff.expandButtonText
                diff.expandButton.addEventListener('click', e => {
                    e.stopPropagation()
                    diff.onClick()
                }, true)
                log('replace', content)
            } else {
                return
            }
            contentInner.addEventListener('click', e => {
                e.stopPropagation()
                diff.onClick()
            }, true)
        })
    }
})

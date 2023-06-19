$(document).ready(function () {
    // Add "active" highlight to TOC on left.
    // Credit: https://codemyui.com/sidebar-menu-scroll-progress-indicator/
    (function () {
        const svg_html = ' \
      <svg class="toc-marker" width="200" height="200" \
           xmlns="http://www.w3.org/2000/svg"> \
        <path stroke="#444" stroke-width="1.5" fill="transparent" \
              stroke-dasharray="0, 0, 0, 1000" stroke-linecap="round" \
              stroke-linejoin="round" transform="translate(-0.5, -0.5)" /> \
      </svg> \
      '
        document.querySelector("#table-of-contents .toc-wrapper").innerHTML += svg_html;
    })();

    // Jekyll renders everything on one level, so nested titles are not actually
    // nested in the DOM. We need to manually create the levels.
    const contentElems = document.querySelector(".post-content").children;
    // A `tocItem` is a dictionary.
    const tocItems = [].slice
        .call(document.querySelectorAll("#table-of-contents li.toc-entry"))
        .map(function (item) {
            const anchor = item.querySelector("a");
            const subList = item.querySelector("ul");
            return {
                item: item,
                href: anchor.getAttribute("href").substr(1),  // remove '#' prefix
                anchor: anchor,
                subList: subList,
            };
        });
    let tocPointer = 0;
    const validTags = ["H1", "H2", "H3", "H4", "H5", "H6"];
    for (let index = 0; index < contentElems.length; ++index) {
        const elem = contentElems[index];
        if (validTags.indexOf(elem.tagName) !== -1) {
            const level = parseInt(elem.tagName[1]);

            if (tocPointer > 0 && tocPointer <= tocItems.length) {
                tocItems[tocPointer - 1].targetBottom = contentElems[index - 1];
            }

            // Current element matches the next entry in the TOC.
            if (tocPointer < tocItems.length &&
                elem.id === tocItems[tocPointer].href) {
                const curTocItem = tocItems[tocPointer];
                curTocItem.level = level;
                curTocItem.titleElem = elem;
                ++tocPointer;
            }
        }
    }
    // Final TOC items has not yet ended.
    if (tocPointer > 0 && tocPointer <= tocItems.length) {
        tocItems[tocPointer - 1].targetBottom = contentElems[contentElems.length - 1];
    }

    let pathLength;

    const tocPath = document.querySelector('.toc-marker path');

    function drawPath() {
        const path = [];
        let pathIndent,
            topOffset = 0;

        // pathLength = 100000;
        // setActivePath(currentActiveIndex);

        tocItems.forEach(function (item) {
            const x = item.anchor.offsetLeft - 5,
                height = item.anchor.offsetHeight;
            const y = topOffset;

            const parent = item.item.parentNode;

            if (!(parent.classList.contains("section-nav") ||
                parent.parentNode.classList.contains("expand"))) {
                // Top-level section.
                item.pathStart = 0;
                item.pathEnd = 0;
                return;
            }

            if (path.length === 0) {
                path.push('M', x, y, 'L', x, y + height);
                item.pathStart = 0;
            } else {
                // Draw an additional line when there's a change in
                // indent levels.
                if (pathIndent !== x) path.push('L', pathIndent, y);
                path.push('L', x, y);

                // Set the current path so that we can measure it.
                tocPath.setAttribute('d', path.join(' '));
                item.pathStart = tocPath.getTotalLength() || 0;

                path.push('L', x, y + height);
            }
            topOffset += height;

            pathIndent = x;
            tocPath.setAttribute('d', path.join(' '));
            item.pathEnd = tocPath.getTotalLength();
        });

        pathLength = tocPath.getTotalLength();
    }

    let currentActiveIndex = null;

    function setActivePath(index) {
        // Specify the visible path or hide the path altogether
        // if there are no visible items.
        if (index !== null) {
            const pathStart = tocItems[index].pathStart;
            const pathEnd = tocItems[index].pathEnd;
            if (pathEnd === 0) {
                // no-op
            } else {
                tocPath.setAttribute('stroke-dashoffset', '1');
                // Set dash end to an infinitely large value to avoid
                // accidental repetition of pattern.
                tocPath.setAttribute(
                    'stroke-dasharray',
                    '1, ' + pathStart + ', ' + (pathEnd - pathStart) + ', ' + 10000000);
                tocPath.setAttribute('opacity', 1);
            }
            // console.log(index, tocItems[index].href, pathStart, pathEnd, pathLength);
        } else {
            tocPath.setAttribute('opacity', 0);
        }
    }

    function setActiveEntryClass(index, className) {
        // Set CSS classes for the current index and ancestors.
        const isActive = Array(tocItems.length).fill(false);
        // Compute heights of each item after expanding here, because `scrollHeight`
        // does not take into account inner height of nested non-expanded lists that
        // will also be expanded next.
        const expandedHeights = Array(tocItems.length).fill(0);

        if (index !== null) {
            let item = tocItems[index];
            let curLevel = Infinity;
            let accumulateHeight = 0;
            for (let i = index; i >= 0; --i) {
                item = tocItems[i];
                if (item.level < curLevel) {
                    curLevel = item.level;
                    if (item.subList !== null)
                        accumulateHeight += item.subList.scrollHeight;
                    expandedHeights[i] = accumulateHeight;
                    isActive[i] = true;
                }
            }
        }

        const itemsToAdd = [], itemsToRemove = [];
        const addHeights = [];
        for (let i = 0; i < tocItems.length; ++i) {
            const item = tocItems[i];
            if (item.item.classList.contains(className)) {
                if (!isActive[i]) {
                    item.item.classList.remove(className);
                    if (item.subList !== null) {
                        itemsToRemove.push(item.subList);
                    }
                }
            } else {
                if (isActive[i]) {
                    item.item.classList.add(className);
                    if (item.subList !== null) {
                        itemsToAdd.push(item.subList);
                        addHeights.push(expandedHeights[i]);
                    }
                }
            }
        }

        return {
            add: itemsToAdd,
            addHeights: addHeights,
            remove: itemsToRemove,
        };
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Ticket-based queue.
    let transitionTicket = 0, transitionCounter = 0;

    // Credit: https://css-tricks.com/using-css-transitions-auto-dimensions/
    async function toggleItems() {

        // Empty loop waiting for ticket.
        const ticket = transitionCounter++;
        while (ticket !== transitionTicket) {
            await sleep(100);
        }

        // if (ticket + 1 !== transitionCounter) {
        //   transitionTicket = ticket + 1;
        //   return;
        // }

        // Use the latest active index.
        const index = currentActiveIndex;
        itemChanges = setActiveEntryClass(index, "expand");

        if (itemChanges.add.length === 0 && itemChanges.remove.length === 0) {
            // if (ticket + 1 === transitionCounter) {
            // Only perform callback on final ticket.
            // drawPath();
            setActivePath(index);
            // }
            // Null transition, release ticket.
            transitionTicket = ticket + 1;
            return;
        }

        const firstItem = (itemChanges.add.length > 0 ?
            itemChanges.add[0] : itemChanges.remove[0]);
        const originalTransition = firstItem.style.transition;
        const allItems = itemChanges.add.concat(itemChanges.remove);

        const targetHeight = itemChanges.addHeights;
        allItems.forEach(item => item.style.transition = "");
        for (let item of itemChanges.add) {
            item.style.height = "0";
        }
        for (let item of itemChanges.remove) {
            item.style.height = item.scrollHeight + "px";
        }
        firstItem.offsetHeight;  // trigger reflow

        requestAnimationFrame(function () {
            for (let i = 0; i < itemChanges.add.length; ++i) {
                const item = itemChanges.add[i];
                item.style.height = targetHeight[i] + "px";
            }
            for (let i = 0; i < itemChanges.remove.length; ++i) {
                const item = itemChanges.remove[i];
                item.style.height = "0";
            }
            allItems.forEach(item => item.style.transition = originalTransition);
            firstItem.offsetHeight;  // trigger reflow

            firstItem.addEventListener('transitionend', function (e) {
                // Event listeners are also fired for children nodes.
                if (e.target !== firstItem) return;
                e.target.removeEventListener(e.type, arguments.callee);
                for (let item of itemChanges.add) {
                    item.style.height = "auto";
                }
                for (let item of itemChanges.remove) {
                    item.style.height = null;
                }
                firstItem.offsetHeight;  // trigger reflow

                // End of transition, release ticket.
                transitionTicket = ticket + 1;
            });

            drawPath();
            setActivePath(index);
        });
    }

    function updateActive(event, forceRedraw = false) {
        const windowHeight = window.innerHeight;

        // We only allow one entry to be active. This entry must satisfy one of the
        // following conditions:
        // 1. Its section is the only section visible on screen.
        // 2. Its title (`targetTop`) is the first title that is within screen bounds.
        const titlePos = tocItems.map(function (item) {
            return item.titleElem.getBoundingClientRect();
        });
        const targetBottom = tocItems.map(function (item) {
            return item.targetBottom.getBoundingClientRect().bottom;
        });

        let index = 0;
        for (; index < tocItems.length; ++index) {
            if (// Any portion of title is within screen bounds.
                (0 < titlePos[index].bottom && titlePos[index].top < windowHeight) ||
                // Section is the only one on screen...
                (titlePos[index].top < 0 &&
                    // ... and is the final section.
                    ((index === tocItems.length - 1 &&
                        targetBottom[index] > 0) ||
                        // ... and the next section title is not completely shown.
                        (index < tocItems.length - 1 &&
                            titlePos[index + 1].bottom > windowHeight)))) {
                break;
            }
        }
        if (index >= tocItems.length) index = null;

        if (currentActiveIndex !== index || forceRedraw) {
            // console.log("redraw", currentActiveIndex, index, forceRedraw);
            currentActiveIndex = index;

            // setActivePath(index);
            setActiveEntryClass(index, "active");

            requestAnimationFrame(function () {
                toggleItems();
            });
        }
    }

    drawPath();
    updateActive(true);
    window.addEventListener('resize', function (event) {
        updateActive(event, true);
    }, false);
    window.addEventListener('scroll', updateActive, false);

});

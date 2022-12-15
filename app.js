const swPath = "/sw.js"
const url = "/test.html"
const urlImage = "https://api.github.com/emojis"

consoleLog = []
let imgArray

function putLog(consoleStr) {
    console.log(` ${consoleStr} `)
    consoleLog.unshift(` ${consoleStr} `)
}


window.addEventListener("DOMContentLoaded", async event => {
    let tabs = document.querySelector(".navbar-nav")
    let tabsLink = document.querySelectorAll(".nav-link")
    const tabsContent = document.querySelectorAll(".tabs-cont")
    const menuToggle = document.querySelector("#navbarNav")
    const bsCollapse = new bootstrap.Collapse(menuToggle)

    register()

    document.querySelector("#getSW").addEventListener("click", queryToServerCatchSW)

    if (tabs) {
        tabs.addEventListener("click", tabsActivate)
    }

    async function tabsActivate(event) {

        if (event.target.classList.contains("nav-link" && "support")) {
            const tabsPath = event.target.dataset.tabsPath;
            document.querySelector(`[data-tabs-path=${tabsPath}]`).classList.add("activte")
            bsCollapse.toggle()
            tabsHandler(tabsPath)
        }
        if (event.target.dataset.tabsPath === "emogis") {
            getImage()
        }
    }

    const tabsHandler = (path) => {
        tabsContent.forEach(element => {
            element.classList.add("d-none")
        })
        tabsLink.forEach(element => {
            element.classList.remove("active")
        })

        document.querySelector(`[data-tabs-target="${path}"]`).classList.remove("d-none")
        document.querySelector(`[data-tabs-path="${path}"]`).classList.add("active")
    }

})


async function queryToServerCatchSW(ev) {
    putLog(`Requset to: ${url}`)
    ev.preventDefault()
    fetch(url).then((data) => {
        if (data.ok)
            data.text().then((body) => {
                let log = JSON.parse(body)
                let table = document.querySelector('.tabsw')
                table.append(getTableBody({
                    element: log,
                    rNameTD: "Service Worker"
                }))
                table.append(getTableBody({
                    element: consoleLog,
                    rNameTD: "DOM",
                    rColorTD2: "table-info"
                }))
            })
        else {
            console.log(`${data.status}`)
        }
    }).catch((err) => {
        console.log(err)
    })
}

function getTableBody(options) {
    let tBody = document.createElement("tbody")

    for (let i = 0; i < options.element.length; i++) {
        let tRow = document.createElement("tr")
        tRow.classList.add(typeof (options.rColorTR) !== "undefined" ? options.rColorTR : "table-primary")
        let td = document.createElement("td")
        td.classList.add(typeof (options.rColorTD) !== "undefined" ? options.rColorTD : "table-light")
        td.innerHTML = options.rNameTD
        tRow.append(td)

        td = document.createElement("td")
        td.classList.add(typeof (options.rColorTD2) !== "undefined" ? options.rColorTD2 : "table-success")
        td.innerText = options.element[i]
        tRow.append(td)
        tBody.append(tRow)
    }
    return tBody
}

async function register() {
    if (navigator.serviceWorker) {
        try {
            const registration = await navigator.serviceWorker.register(swPath)
            putLog("Service worker register")
            if (navigator.serviceWorker.controller) {
                putLog("Service worker install")
            }
        } catch (error) {
            console.log(`${error}`)
        }
    } else {

    }
}

async function getImage() {
    fetch(urlImage).then((data) => {
        if (data.ok) {
            data.json().then((img) => {
                imgArray = img
                createPlaceholder()
            })
        }
    }).then((err) => {
        console.log(err)
    })

}

function createPlaceholder() {
    let sourceDiv = document.querySelector(".table-emogis")
    sourceDiv.innerHTML = ""
    let cardGroup = document.createElement('div')
    cardGroup.classList.add("card-group")

    for (let [name, src] of Object.entries(imgArray)) {
        let colDiv = document.createElement("div")
        colDiv.classList.add("col")
        let card = document.createElement("div")
        card.classList.add("card", "h-100")
        let cardBody = document.createElement("div")
        cardBody.classList.add("card-body")

        let img = document.createElement('img')
        img.src = "/icons/placeholder.png"
        img.setAttribute('datagit', src)
        img.alt = name
        img.classList.add("image-lazy")
        let span = document.createElement('span')
        span.innerHTML = name
        span.classList.add("card-text")

        cardBody.append(span)
        card.append(img)
        card.append(cardBody)
        colDiv.append(card)
        cardGroup.append(colDiv)
    }
    sourceDiv.append(cardGroup)
    attachObserver()
}

function attachObserver() {
    let imagesToLoad = document.querySelectorAll(".image-lazy")

    const loadImages = (image) => {
        image.setAttribute("src", image.getAttribute("datagit"))
        image.onload = () => {
            image.removeAttribute("datagit")

        }
    }
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((items, observer) => {
            items.forEach((item) => {
                if (item.isIntersecting) {
                    loadImages(item.target)
                    observer.unobserve(item.target)
                }
            })
        })
        imagesToLoad.forEach((img) => {
            observer.observe(img)
        })
    } else {
        imagesToLoad.forEach((img) => {
            loadImages(img)
        })
    }
}

const addBtn = document.querySelector('#install-app')
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = "block";
  
    addBtn.addEventListener("click", (e) => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = "none";
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        deferredPrompt = null;
      });
    });
  });
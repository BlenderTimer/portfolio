String.prototype.getLink = function() {return this.toString().toLowerCase().replace(/ /g, "_").replace(/ü/g, "u")};
Array.prototype.max = function() {return Math.max.apply(null, this)};
Array.prototype.min = function() {return Math.min.apply(null, this)};

let portfolioCollection = "Featured Photos";
let portfolioCategory = "photo";
try {portfolioCollection = new URL(window.location.toString()).searchParams.get("c").replace(/\-/g, " ").toProperCase(1)} catch {};
if (portfolioCollection.includes("Photo")) {portfolioCategory = "photo"}
else if (portfolioCollection.includes("Video")) {portfolioCategory = "video"}
else if (portfolioCollection.includes("Music")) {portfolioCategory = "music"};
document.getElementById('ph-title').children[1].innerHTML = portfolioCollection;
document.title = `${portfolioCollection} - Daniel Roberts - BlenderTimer`

const portfolioContent = document.getElementById('portfolio-content');
const contentViewerContainer = document.getElementById('content-viewer-container');
const contentViewer = document.getElementById('content-viewer');
const viewerContentBox = document.getElementById('viewer-left');
const viewerContentInfo = document.getElementById('viewer-right');
let contentViewing = "";
let columns = 3;
let photoList = [...photos];
photoList.sort((a, b) => (parseDate(a.date).getTime() < parseDate(b.date).getTime()) ? 1 : -1);
let photoLoadID = 0;
let columnWidth = 0;
let photosReach = 0;
let columnHeights = [];
let contentSize = {w:0,h:0};

window.addEventListener('scroll', function() {loadContent()});
window.addEventListener('resize', function() {fitPreview()});
window.addEventListener('keypress', (e) => {
	if (e.key == "R") {document.getElementById('rating-spr').removeAttribute('style');document.getElementById('rating').removeAttribute('style')};
})

// ----- LOAD COLLECTIONS -----
const portfolioCollections = document.getElementById('portfolio-collections-list');
let collections = [];
if (portfolioCategory == "photo") {collections = photoCollections};
for (let c of collections) {
	if (c == "Featured Photos" && portfolioCollection == "Featured Photos") {portfolioCollections.innerHTML += `<a href="/" class="viewing-collection">Featured Photos</a>`}
	else if (c == "Featured Photos") {portfolioCollections.innerHTML += `<a href="/">Featured Photos</a>`}
	else if (portfolioCollection == c) {portfolioCollections.innerHTML += `<a href="?c=${c.toLowerCase().replace(/ /g, "-")}" class="viewing-collection">${c}</a>`}
	else {portfolioCollections.innerHTML += `<a href="?c=${c.toLowerCase().replace(/ /g, "-")}">${c}</a>`}
}
let leftScroll = 0;
for (let el of portfolioCollections.children) {
	if (el.textContent == portfolioCollection) {
		portfolioCollections.scrollLeft = leftScroll+20-(portfolioCollections.getBoundingClientRect().width/2)+((el.getBoundingClientRect().width+20)/2);
	}
	leftScroll += 10 + el.getBoundingClientRect().width;
}

function collectionsScroll(e) {
	if (e.target.alt == "Left Arrow") {
		portfolioCollections.scrollBy({left:-window.innerWidth / 3, behavior: "smooth"});
	}
	else {
		portfolioCollections.scrollBy({left:window.innerWidth / 3, behavior: "smooth"});
	}
}

function collectionsScrollWheel(e) {
	e.preventDefault();
	portfolioCollections.scrollBy({left:e.deltaY, behavior: "smooth"});
}

checkContentViewing();

// ----- LOAD PHOTOS -----

if (portfolioCategory == "photo") {
	let h = -5 + portfolioContent.offsetTop+50;
	if (window.innerWidth > 1500) {
		portfolioContent.innerHTML = `<div class="content-column"></div><div class="content-column"></div><div class="content-column"></div>`;
		portfolioContent.classList.add("three-column");
		columns = 3;
		columnHeights = [h, h, h];
	}
	else if (window.innerWidth > 800) {
		portfolioContent.innerHTML = `<div class="content-column"></div><div class="content-column"></div>`;
		portfolioContent.classList.add("two-column");
		columns = 2;
		columnHeights = [h, h];
	}
	else {
		portfolioContent.innerHTML = `<div class="content-column"></div>`;
		portfolioContent.classList.add("one-column");
		columns = 1;
		columnHeights = [h];
	}
	columnWidth = portfolioContent.children[0].getBoundingClientRect().width;
	photosReach = h;
	loadPhotos();
}

function loadContent() {
	if (portfolioCategory == "photo") {loadPhotos()};
}

function loadPhotos() {
	while (photoLoadID < photoList.length) {
		if ((photosReach-window.scrollY) > (window.innerHeight * 3)) {break};
		let photo = photoList[photoLoadID];
		if (photo.collections.indexOf(portfolioCollection) > -1) {
			if (contentViewing.length > 0 && photo.title.toLowerCase() == contentViewing) {
				document.title = `${photo.title} - Daniel Roberts - BlenderTimer`;
				showContentViewer();
			}
			const item = document.createElement('a');
			item.className = "content-photo";
			item.href = "?m=" + photo.title.getLink();
			item.addEventListener('click', (e) => {
				e.preventDefault();
				let url = new URL(window.location.href);
				url.searchParams.set("m", photo.title.getLink());
				url = url.origin + url.pathname + url.search;
				history.replaceState({}, `${photo.title} - Daniel Roberts - BlenderTimer`, url);
				checkContentViewing();
			});
			item.innerHTML = `<img src="/media/photos/${photo.title.getLink()}-thumb.${photo.filetype.indexOf("/") > -1 ? photo.filetype.removeBefore("/", 1) : photo.filetype}"><div class="item-hover"><div class="item-hover-border"></div></div>`;
			let addColumn = columnHeights.indexOf(photosReach);
			portfolioContent.children[addColumn].appendChild(item);
			let aspect = photo.width/photo.height;
			columnHeights[addColumn] += (columnWidth/aspect)+5;
			photosReach = columnHeights.min();
		}
		photoLoadID++;
	}
}

function fitPreview() {
	if (window.innerWidth < 1100) {viewerContentBox.removeAttribute('style');return};
	var w = contentSize.w;
	var h = contentSize.h;
	var winspace = 20; //--winspace
	var winspace2 = winspace*2;
	var scr = {w:window.innerWidth-winspace2-winspace2,h:window.innerHeight-winspace2-winspace2-50};
	var winsize = {w:w+300+winspace2,h:h+winspace2};
	var imgsize = {pw:w / (h/(scr.h-winspace2)),ph:scr.h-winspace2,lw:scr.w-300-winspace2,lh:h / (w/(scr.w-300-winspace2))}
	if (((scr.w-(imgsize.pw+300+winspace2)-(winspace2*2))+(scr.h-(imgsize.ph+winspace2)-(winspace2*2))) < ((scr.w-(imgsize.lw+300+winspace2)-(winspace2*2))+(scr.h-(imgsize.lh+winspace2)-(winspace2*2)))) { // landscape
		viewerContentBox.style.width = imgsize.lw + "px";
		viewerContentBox.style.height = imgsize.lh + "px";
	}
	else { // portrait
		viewerContentBox.style.width = imgsize.pw + "px";
		viewerContentBox.style.height = imgsize.ph + "px";
	}
}

function checkContentViewing(loadTitle = true) {
	if (new URL(window.location.href).searchParams.get('m')) {
		contentViewing = new URL(window.location.href).searchParams.get('m')
		.replace(/_/g, " ")
		.replace("luderitz", "lüderitz");
		if (loadTitle == true) {
			if (portfolioCategory == "photo") {
				for (let i=0; i < photos.length; i++) {
					let photo = photos[i];
					if (photo.collections.indexOf(portfolioCollection) > -1) {
						if (contentViewing.length > 0 && photo.title.toLowerCase() == contentViewing) {
							document.title = `${photo.title} - Daniel Roberts - BlenderTimer`;
							viewerContentBox.innerHTML = `<img width="${photo.width}" height="${photo.height}" src="/media/photos/${photo.title.getLink()}-thumb.${photo.filetype.indexOf("/") > -1 ? photo.filetype.removeBefore("/", 1) : photo.filetype}" alt='${photo.title}${photo.subject&&photo.subject.length>0 ? " (" + photo.subject + ")":""} by Daniel Roberts (BlenderTimer)'>`;
							contentSize = {w:photo.width,h:photo.height};
							fitPreview();
							setTimeout(function() {viewerContentBox.children[0].src = `/media/photos/${photo.title.getLink()}-preview.${photo.filetype.indexOf("/") > -1 ? photo.filetype.removeBefore("/", 1) : photo.filetype}`}, 1);
							let html = `<h1>${photo.title}</h1>`;
							if (photo.subject && photo.subject.length > 0) {
								html += `<h3>${photo.subject}</h3>`;
							}
							if (photo.caption && photo.caption.length > 0) {
								html += `<p class="info-caption">${photo.caption}</p>`;
							}
							html += `<div class="content-info-grid">`;
							if (photo.shutterspeed && photo.shutterspeed.length > 0) {
								html += `<div class="info-tile"><b>Shutter-speed</b><p>${photo.shutterspeed} sec.</p></div>`;
							}
							else {
								html += `<div class="info-tile"><b>Shutter-speed</b><i>N/A</i></div>`;
							}
							if (photo.aperture && photo.aperture.length > 0) {
								html += `<div class="info-tile"><b>Aperture</b><p>f/${photo.aperture}</p></div>`;
							}
							else {
								html += `<div class="info-tile"><b>Aperture</b><i>N/A</i></div>`;
							}
								html += `<div class="spr"></div><div class="spr"></div>`;
							if (photo.iso && photo.iso.length > 0) {
								html += `<div class="info-tile"><b>ISO</b><p>${photo.iso}</p></div>`;
							}
							else {
								html += `<div class="info-tile"><b>ISO</b><i>N/A</i></div>`;
							}
							if (photo.focallength && photo.focallength.length > 0) {
								html += `<div class="info-tile"><b>Focal length</b><p>${photo.focallength}mm</p></div>`;
							}
							else {
								html += `<div class="info-tile"><b>Focal length</b><i>N/A</i></div>`;
							}
							html += `</div>`;
							if (photo.camera && photo.camera.length > 0) {
								html += `<div class="info-line"><b>Camera:</b><p>${photo.camera}</p></div>`;
								html += `<div class="spr"></div>`;
							}
							if (photo.lens && photo.lens.length > 0) {
								html += `<div class="info-line"><b>Lens:</b><p>${photo.lens}</p></div>`;
								html += `<div class="spr"></div>`;
							}
							if (photo.date && photo.date.length > 0) {
								html += `<div class="info-line"><b>Date captured:</b><p>${readableDate(parseDate(photo.date))}</p></div>`;
								html += `<div class="spr"></div>`;
							}
							html += `<div class="info-line"><b>Resolution:</b><p>${photo.width.toString()}x${photo.height.toString()} (${Math.round((photo.width*photo.height)/1000000).toString()}MP)</p></div>`;
							html += `<div class="spr" style="display: none;" id="rating-spr"></div>`;
							html += `<div class="info-line" style="display: none;" id="rating"><b>Rating:</b><p>${photo.rating}</p></div>`;
							if (photo.location && photo.location.length > 0) {
								html += `<div class="spr"></div>`;
								if (photo.location.indexOf("http") > -1) {
									html += `<a class="info-location" href="${photo.location.removeBefore("|", 1).removeAfter("|", -1, true)}" title="${photo.location.removeBefore("|", 1, true)}" target="_blank"><img src="https://blendertimer.com/static/images/icons/location.svg" alt="Location"><b>${photo.location.removeAfter("|", -1)}</b></a>`;
								}
								else {
									html += `<div class="info-location"><img src="https://blendertimer.com/static/images/icons/location.svg" alt="Location"><b>${photo.location}</b></div>`;;
								}
							}
							html += `<div class="info-tags">`;
							if (photo.tags && photo.tags.length > 0) {
								for (let b=0; b < photo.tags.length; b++) {
									html += `<p>${photo.tags[b]}</p>`;
								}
							}
							html += `</div>`;
							html += `<a id="download-btn" href="/media/photos/${photo.title.getLink()}.${photo.filetype.indexOf("/") > -1 ? photo.filetype.removeAfter("/", -1) : photo.filetype}" download="${photo.title} by Daniel Roberts (BlenderTimer).${photo.filetype.indexOf("/") > -1 ? photo.filetype.removeAfter("/", -1) : photo.filetype}">Download Photo</a>`;
							html += `<i id="download-info">Free for commercial use under the <a href="https://blendertimer.com/licenses/bt-m" target="_blank">BT-M License</a>. No attribution required!</i>`;
							viewerContentInfo.innerHTML = html;
						}
					}
				}
			}
		}
		showContentViewer();
	}
}

function attemptCloseContentViewer(e) {
	let el = e.target || e.srcElement;
	if (el.id == "content-viewer-container") {closeContentViewer()};
}

function closeContentViewer() {
	document.title = `${portfolioCollection} - Daniel Roberts - BlenderTimer`;
	let url = new URL(window.location.href);
	url.searchParams.delete("m");
	url = url.origin + url.pathname + url.search;
	history.replaceState({}, `${portfolioCollection} - Daniel Roberts - BlenderTimer`, url);
	contentViewerContainer.style.opacity = "0";
	contentViewerContainer.style.pointerEvents = "none";
	contentViewer.style.transform = "scale(0)";
}

function showContentViewer() {
	viewerContentInfo.scrollTo(0, 0);
	contentViewerContainer.removeAttribute('style');
	contentViewer.removeAttribute('style');
}

function parseDate(date) {
	let year = parseInt(date.removeAfter("-", -1));
	let month = parseInt(date.removeAfter("-", -1, true).removeBefore("-", 1));
	let day = parseInt(date.removeBefore("-", 1, true));
	return new Date(year, month-1, day);
}

function readableDate(date) {
	return `${date.toLocaleString('default', {month:'long'})} ${date.getDate()}, ${date.getFullYear()}`;
}
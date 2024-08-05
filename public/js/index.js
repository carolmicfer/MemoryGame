const socket = io();
const cards = document.querySelectorAll(".memory-card");
const cardsArray = Array.from(cards);
const flags = [
	{
		src: "/img/br.svg",
		alt: "brazil",
	},
	{
		src: "/img/it.svg",
		alt: "italy",
	},
	{
		src: "/img/fr.svg",
		alt: "france",
	},
	{
		src: "/img/jp.svg",
		alt: "japan",
	},
	{
		src: "/img/au.svg",
		alt: "australia",
	},
	{
		src: "/img/kr.svg",
		alt: "korea",
	},
	{
		src: "/img/br.svg",
		alt: "brazil",
	},
	{
		src: "/img/it.svg",
		alt: "italy",
	},
	{
		src: "/img/fr.svg",
		alt: "france",
	},
	{
		src: "/img/jp.svg",
		alt: "japan",
	},
	{
		src: "/img/au.svg",
		alt: "australia",
	},
	{
		src: "/img/kr.svg",
		alt: "korea",
	},
];

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function flipCard() {
	if (lockBoard) return;
	if (this === firstCard) return;

	this.classList.add("flip");

	socket.emit("flip card", {
		id: this.dataset.flag,
	});

	if (!hasFlippedCard) {
		hasFlippedCard = true;
		firstCard = this;
		return;
	}

	secondCard = this;
	checkForMatch();
}

function checkForMatch() {
	let isMatch = firstCard.dataset.flag === secondCard.dataset.flag;

	if (isMatch) {
		socket.emit("find match", {
			firstCard: firstCard.dataset.flag,
			secondCard: secondCard.dataset.flag
		});
		disableCards();
		return;
	}

	unflipCards();
}

function disableCards() {
	firstCard.removeEventListener("click", flipCard);
	secondCard.removeEventListener("click", flipCard);

	resetBoard();
}

function unflipCards() {
	lockBoard = true;

	setTimeout(() => {
		firstCard.classList.remove("flip");
		secondCard.classList.remove("flip");

		socket.emit("unflip cards", {
			firstCard: firstCard.dataset.flag,
			secondCard: secondCard.dataset.flag
		});

		resetBoard();
	}, 1500);
}

function resetBoard() {
	[hasFlippedCard, lockBoard] = [false, false];
	[firstCard, secondCard] = [null, null];
}

(function shuffle() {
	for (let i = flags.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[flags[i], flags[j]] = [flags[j], flags[i]];
	}
	for (let i = 0; i < cardsArray.length; i++) {
		let card = cardsArray[i];
		card.firstElementChild.setAttribute("src", flags[i].src);
		card.firstElementChild.setAttribute("alt", flags[i].alt);
		card.setAttribute("data-flag", flags[i].alt);
	}
	socket.emit("set order", cardsArray.map((card) => {
		return {
			dataset: card.dataset.flag,
			firstElementChild: {
				src: card.firstElementChild.src,
				alt: card.firstElementChild.alt
			}
		};
	}));
})();
cards.forEach((card) => card.addEventListener("click", flipCard));

socket.on("card flipped", (data) => {
	const card = document.querySelector(`.memory-card[data-flag="${data.id}"]`);
	if (card) {
		card.classList.add("flip");
	}
});

socket.on("cards unflipped", (data) => {
	const firstCard = document.querySelector(`.memory-card[data-flag="${data.firstCard}"]`);
	const secondCard = document.querySelector(`.memory-card[data-flag="${data.secondCard}"]`);
	if (firstCard && secondCard) {
		firstCard.classList.remove("flip");
		secondCard.classList.remove("flip");
	}
});

socket.on("match found", (data) => {
	const firstCard = document.querySelector(`.memory-card[data-flag="${data.firstCard}"]`);
	const secondCard = document.querySelector(`.memory-card[data-flag="${data.secondCard}"]`);
	if (firstCard && secondCard) {
		firstCard.removeEventListener("click", flipCard);
		secondCard.removeEventListener("click", flipCard);
	}
});

socket.on("order set", (data) => {
	console.log(data);
	data.forEach((card) => {
		console.log(card.dataset);
		const cardElement = document.querySelector(`.memory-card[data-flag="${card.dataset}"]`);
		cardElement.firstElementChild.setAttribute("src", card.firstElementChild.src);
		cardElement.firstElementChild.setAttribute("alt", card.firstElementChild.alt);

	});
});
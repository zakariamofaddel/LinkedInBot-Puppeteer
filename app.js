const puppeteer = require("puppeteer");
require("dotenv").config();

let screenNumber = 0;

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(
		"https://www.linkedin.com/uas/login?session_redirect=https%3A%2F%2Fwww%2Elinkedin%2Ecom%2Fsearch%2Fresults%2Fpeople%2F%3Fkeywords%3Djunior%2520developer%26origin%3DSUGGESTION&fromSignIn=true&trk=cold_join_sign_in",
		{ waitUntil: "networkidle2" }
	);
	await page.setViewport({
		width: 1200,
		height: 800,
	});
	await page.waitForSelector('input[id="username"');
	await page.type('input[id="username"', `${process.env.LI_EMAIL}`);
	await page.type('input[id="password"', `${process.env.LI_PASSWORD}`);
	await page.click('button[aria-label="Sign in"]');
	// Add a wait for some selector on the home page to load to ensure the next step works correctly
	await page.waitForNavigation({
		waitUntil: "networkidle2",
	});

	await autoScroll(page);

	await page.click(`button[aria-label="Pagina 2"]`);

	await page.waitForNavigation({
		waitUntil: "networkidle2",
	});

	// go to next page

	for (let pageNumber = 3; pageNumber < 70; pageNumber++) {
		await page.click(`button[aria-label="Pagina ${pageNumber}"]`);

		await page.waitForNavigation({
			waitUntil: "networkidle2",
		});

		await page.waitForSelector(
			'p[class="mt2 t-12 t-black--light t-normal search-result__snippets-black"]'
		);

		await autoScroll(page);

		const snippets = await page.evaluate(() =>
			Array.from(
				document.getElementsByClassName(
					"mt2 t-12 t-black--light t-normal search-result__snippets-black"
				),
				(e) => e.innerText
			)
		);

		snippets.forEach((snippet) => {
			let companies = [];
			let company = trim(snippet);

			if (!companies.includes(company)) {
				companies.push(company);
			}

			console.log(`Page ${pageNumber - 1} COMPANIES:`, companies);
		});
	}

	await browser.close();
})();

async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 100);
		});
	});
}

function trim(words) {
	var n = words.split(" ");
	return `${n[n.length - 2]} ${n[n.length - 1]}`;
}

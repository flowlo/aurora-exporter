Array.fromList = function(list) {
	var array = new Array(list.length);
	for (var i = 0; i < list.length; i++)
		array[i]= list[i];
	return array;
};

function extract() {
	return {
		reviews: extractReviews(),
		submission: extractSubmission(),
		figures: extractFigures(),
		evaluation: extractEvaluation(),
		title: extractTitle()
	};
}

function extractReviews() {
	return Array.fromList(document.querySelectorAll('div.view_review')).map(function (div) {
		return {
			questions:
				Array.fromList(div.querySelectorAll('div.question_container')).map(function (div) {
					console.log(div);
					return {
						question: div.querySelector('div').textContent.trim(),
						answer: div.querySelector('textarea').value
					};
			}),
			appraisal: div.querySelector('div.appraisal b').textContent.trim()
		};
	});
}

function extractSubmission() {
	return document.querySelector('iframe').contentDocument.body.innerHTML;
}

function extractFigures() {
	return Array.fromList(document.querySelectorAll('[data-lightbox="preview"]')).map(function (it) {
		return it.getAttribute('href');
	});
}

function extractTitle() {
	return document.querySelector('div.challenge_title').textContent.trim();
}

function extractEvaluation() {
	var element = document.querySelector('div.evaluation_text');
	if (element == null) {
		return "";
	}
 	return element.innerHTML;
}

function fetchFigures(challenge, zip, callback) {
	function fetchAt(i) {
		if (i == challenge.figures.length) {
			callback();
			return;
		}
		var it = challenge.figures[i];
		JSZipUtils.getBinaryContent(it, function(err, data) {
			if (err) {
				throw err;
			}
			zip.file(it.substring(it.lastIndexOf('/'), it.length), data, { binary: true });
			fetchAt(i + 1);
		});
	}
	fetchAt(0);
}

window.onload = function() {
	var zip = new JSZip();
	var challenge = extract();
	console.log(challenge);
	zip.file('challenge.json', JSON.stringify(challenge, null, 4));
	fetchFigures(challenge, zip, function() {
		var blob = zip.generate({type:"blob"});
		var name = challenge.title.toLowerCase();
		name = name.substring(0, name.indexOf(' '));
		name = name.replace('.', '-') + '.zip';
		saveAs(blob, name);
	});
}

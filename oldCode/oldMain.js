function main(){
	const preview = document.querySelector('img');
	const file = document.querySelector('input[type=file]').files[0]'
	const reader = new FileReader();
	reader.addEventListener('load', function(){
		preview.src = reader.result;
	}, false);

	if (file) {
		reader.readAsDataURL(file);
	}
	//const matchYes = document.querySelector('
}

document.addEventListener('DOMContentLoaded', main);

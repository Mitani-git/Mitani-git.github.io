const data = [
	{
		name: "項目名",
		data: ["ああああああ", "いいいいい", "ううううう"]
	},
	{
		name: "年齢",
		data: [0, 54, 103]
	}
]
const makeCSV = function(arr) {
	let csvData = []
	arr.forEach(function(row){
		let csvRow = [];
		row.forEach(function(item){
			csvRow.push('"' + (item ? item.replace(/"/g, '""') : '') + '"')
		})
		csvData.push(csvRow.join(','))
	})
	return csvData.join('\n')
}

downloadCSV = function(){
	let csvArray = []
	let csvTitleArray = []
	let csvItemsLength = 0
	data.forEach(function(item){
		csvTitleArray.push(item.name)
		 if(csvItemsLength < item.data.length){
			csvItemsLength = item.data.length
		 }
	})
	csvArray.push(csvTitleArray)
	for(let i = 0; i < csvItemsLength; i++){
		let csvItemArray = []
		data.forEach(function(item){
			csvItemArray.push(item.data[i].toString())
		})
		csvArray.push(csvItemArray)
	}
	const csv = makeCSV(csvArray)
	let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
	const blob = new Blob([bom, csv], { type: 'text/csv' })
	const anchor = document.createElement('a')
	const fileName = 'test.csv'
	if (window.navigator.msSaveBlob) {
		// IE用処理
		window.navigator.msSaveBlob(blob, fileName)
	} else if (window.URL && anchor.download !== undefined) {
		// chrome・edge用処理
		anchor.download = fileName
		anchor.href = window.URL.createObjectURL(blob)
		document.body.appendChild(anchor)
		anchor.click()
		anchor.parentNode.removeChild(anchor)
	} else {
		// safari用処理
		window.location.href =
			'data:attachment/csv;charset=utf-8,' + encodeURIComponent(bom + csv)
	}
};

(function(){
	document.getElementById("csv_download_btn").addEventListener("click", downloadCSV)
})();

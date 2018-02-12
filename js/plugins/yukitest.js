function serifu(){

	var player = 'yuki';
	if(player == 'yuki'){
		var serifu = player + "さんこんにちわ";
	}else{
		var serifu = "ヤツレさんちゃーす";
	}
	$gameVariables.setValue(130,serifu);

	for (var i = 0; i <= 10; i++) {
		console.log(i);
	}
}
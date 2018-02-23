

// 変数
// 1^50 プラグイン使用可能性あり
// 51^100 不使用
// 101^125 user情報
// 101 = user_id
// 102 = user_name
// 126^150 area
// 126=area_id, 127=area_status, 
// 130=users_mst_id, 131=area_user_name, 132=areaBoss_id, 
// 140=areaBoss_status配列
// 151^200 tmp
// 151=所持金, 152=必要な料金, 153=set_areaBossId, 154=DB_areaBossId
// 201^249 会話文章変数
// 250 0 or 1 判定に使用
// 251^300 合成
// 251=１体目、252=２体目、253=choiceNext,254=nextChoice,255=choice_mons_id,256=choiceNo,
// 260=result["mons_id"],261=result["enhance"]
// 501~504 セリフ
// 601^1000 特に無し
// 900~1000初召喚かどうかチェック配列(100ずつ)
// 1000=mons
// 1001^2000 mons系で使う

// 0 : _actor.mhp,
// 1 : _actor.mmp,
// 2 : _actor.atk,
// 3 : _actor.def,
// 4 : _actor.mat,
// 5 : _actor.mdf,
// 6 : _actor.agi,
// 7 : _actor.luk

//スイッチ
//1^100　プラグイン使用可能性あり
//201~219=システム
//220~250=合成mons１体目選択済みかどうか　222=やめる選択時、イベント中断処理実行のためフラグ
//251=手持ち被り判定など

// var mons_status_value = [強化値、炎、氷、風、雷、土、物理、回復、補助、万能];
// var choseNo = //選んだ選択肢取得

//敵ステータスいじる方法見本
// var value = this.operateValue(増減, 定数か変数か, 値);

// this.iterateEnemyIndex(敵ID, function(enemy) {

// this.changeHp(enemy, value, 戦闘不能を許可するか);

// }.bind(this));

//アクターを追加


var choiceTime = 0;
var gousei_mons_1;
var gousei_mons_2;
var gousei_mons_3 = [];
var mons_lv;
var mons_hp;
var mons_mp;
var mons_atk;
var mons_def;
var mons_mat;
var mons_mdf;
var mons_agi;
var mons_luk;
var mons_enhance;


var choiceNext = 0;

// var s_mons_id = 0;
var nextChoice = "次へ";
// var mons_id_name_obj = {};
var s_sentakusi = [];
var sentakusi = [];
var choice_mons_id = [];
var mons_id_list = [];

var choiceNo = 0;
var set_mons_id;

var dateObj = new Date();

function set_hensu(id, value){
  $gameVariables.setValue(id,value);
}

function set_switch(id, bool){
  $gameSwitches.setValue(id,bool);
}

function get_hensu(id){
  return $gameVariables.value(id);
}

function get_switch(id){
  return $gameSwitches.value(id);
}

function get_user_name(){
  return $gameActors.actor(1000)._name;
}

function get_actor_name(id){
  return $gameActors.actor(id)._name;
}
//$gameTroop.members()[0].addParam(2,100);
function set_enemy_status(statusStr,value){
  switch(statusStr){
    case "lv": ; break;
  }
}

function clear_message(){
  $gameMessage.clear();
}

function set_message(text){
  $gameMessage.add(text);
}

function newPage_message(){
  $gameMessage.newPage();
}

//file=画像ファイル名、num=フェイス画像の何番目か。上0123、下4567
function set_message_face(file, num){
  $gameMessage.setFaceImage(file, num);
}

//actor追加
function add_actor(mons_id){
  $gameParty.addActor(mons_id);
}

//アクターを除名
function remove_actor(mons_id){
  console.log("remove=" + mons_id);
  $gameParty.removeActor(mons_id);
}

//アクターを初期化（レベル１の状態にする）
function reset_actor(mons_id){
  $gameActors.actor(mons_id).setup(mons_id);
}
//アクター能力値変化。param=変化させるパラメータid
function add_param(mons_id, param, value){
  $gameActors.actor(mons_id).addParam(param, value);
}

//enhanceが設定されてなかったら、初期値を設定する。
function get_enhance(mons_id){
  var enhanceValue = get_hensu(mons_id+1000);
  if (enhanceValue.length == 10) {
    return enhanceValue;
  }
  enhanceValue = [0,0,0,0,0,0,0,0,0,0];
  set_hensu(mons_id+1000, enhanceValue);
  return enhanceValue;
}

//変数127に格納したエリア情報を取りだす
function get_area_status_value(str){
  var status = get_hensu(127);
  return status[str];
}
// areaEvent用に、MV変数にエリア情報を入れる
function set_area_status_value(){
  set_hensu(130, get_area_status_value("users_mst_id"));

}
// enhance配列をDB用にstringにする　例：0000000000
function enhance_to_string(enhance){
  var result = "";
  for (var i = 0; i < enhance.length; i++) {
    result += enhance[i];
  }
  return result;
}

//ajax準備
function XMLHttpRequestCreate(){
					try{
						console.log('xmlok');
						return new XMLHttpRequest();
					}catch(e){}
					try{
						return new ActiveXObject('MSXML2.XMLHTTP.6.0');
					}catch(e){}
					try{
						return new ActiveXObject('MSXML2.XMLHTTP.3.0');
					}catch(e){}
					try{
						return new ActiveXObject('MSXML2.XMLHTTP');
					}catch(e){}

					return null;
				}
var xmlhr = XMLHttpRequestCreate();

//自動セーブのfunc
function data_save(){
	$gameSystem.onBeforeSave();
  //セーブ失敗時にブザーが鳴る
	if (!DataManager.saveGame(DataManager.lastAccessedSavefileId())) {
	    SoundManager.playBuzzer();
	}
}

//テストゲームで値をコンソール出力するデバッッグ用func
function value_test(){
  //確認したい値をtestに入れる
	var test = $gameActors.actor(1)._skills;
	console.log(test);
}

//データベースからデータを取り出す汎用func
//postDataは{"name":user_name,"pass":user_pass}といった様にする
function action_server_ajax(postData,method){
  var response;
  set_switch(202,false);
  postData = JSON.stringify(postData);
  xmlhr.onreadystatechange = function(){
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  set_switch(202,true);
                  response = JSON.parse(xmlhr.responseText);
                  return response;
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  $gameVariables.setValue(501,"通信失敗");
                  response = null;
                  return 
                }
              }
              break;
          }
  };
  
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/" + method);
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//ユーザー登録、使い方：このfuncの後ウェイトをイベントで挟み、登録結果を会話イベントで表示する事
function user_entry(){
  //アクター1000が名前、999がパスワードとする
	var user_name = $gameActors.actor(1000)._name;
	var user_pass = $gameActors.actor(999)._name;
	console.log(user_pass);
  $gameVariables.setValue(1001,"通信に失敗しました");
  //jsonに整形し、データを送信。サーバーで登録できるかチェックされ、返答が返って来る
	var postData = JSON.stringify({"name":user_name,"pass":user_pass});
	xmlhr.onreadystatechange = function(){
					console.log('changestart');
					switch(xmlhr.readyState){
						case 4:
							if(xmlhr.status == 0){
								console.log('通信失敗');
							}else{
								if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
									console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
									var response = JSON.parse(xmlhr.responseText);
                  //登録できたか否かの結果メッセージを変数101に入れ、イベントで表示できる様にしている
									$gameVariables.setValue(201,response.message);
                  //登録されたuser_idを変数101に設定
									$gameVariables.setValue(101, response.user_id * 1);
                  //登録されたuser_nameを変数102に設定
									$gameVariables.setValue(102,response.user_name);
                  if(response.status >= 2){
                    $gameSwitches.setValue(203,true);
                    $gameVariables.setValue(201,response.message);

                  }


								}else{
									console.log("その他の応答:"+xmlhr.status);
									$gameVariables.setValue(101,"通信失敗");
								}
							}
							break;
					}
	};
	
	xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/user_entry");
	xmlhr.setRequestHeader('Content-Type', 'application/json');
	xmlhr.send(postData);
	

}

function gousei_init(){
  set_switch(221, false);
  set_switch(222, false);
  set_hensu(251, 0);
  set_hensu(252, 0);
  set_hensu(253, 0);
  set_hensu(254, 0);
  set_hensu(255, 0);
  set_hensu(260, 0);
  set_hensu(261, 0);
  set_hensu(262, "");
}


//手持ち仲間の選択肢一覧作成
function make_have_mons_id_chose(){
  choiceNext = get_hensu(253);
  var user_name = get_user_name();
	var memberCount = $gameParty.size();
  if(get_hensu(251) != 0){
    var mons1_id = get_hensu(251);
    console.log("dainyu");
  }
  
  s_sentakusi = [];
  mons_id_list = [];
  for (var i=1; i<=8; i++) {
    if(i<memberCount){
        var s_mons_id = $gameParty.members()[i]._actorId;
        var s_mons_name = $gameActors.actor(s_mons_id)._name;
        if(s_mons_id == 1000){
          continue;
        }
        if(s_mons_id == mons1_id){
          s_mons_name = "選択済み";
          s_mons_id = 0;
        }
        s_sentakusi.push(s_mons_name);
        console.log(s_mons_id);
        mons_id_list.push(s_mons_id);
      }else{
        s_sentakusi.push("なし");
        mons_id_list.push(0);
      }
  }
  console.log(s_sentakusi);

  if(memberCount<4){
    nextChoice = "なし";
  }
  for(var i=0;i<4;i++){
    if(choiceNext == 0){
      sentakusi[i] = s_sentakusi[i];
      choice_mons_id[i] = mons_id_list[i];
      nextChoice = "なし";
      if(i == 3 && mons_id_list[4] != 0){
        nextChoice = "次へ";
      }
    }else{
      sentakusi[i] = s_sentakusi[i+4];
      choice_mons_id[i] = mons_id_list[i+4];
      nextChoice = "戻る";
    }
      
  }

  // if(choiceNext == 0){
  //   for(var i=0;i<4;i++){
  //     sentakusi[i] = s_sentakusi[i];
  //     choice_mons_id[i] = mons_id_list[i];
  //   }
  // }else{
  //   for(var i=0;i<4;i++){
      
  //   }
  // }
  set_hensu(254,nextChoice);
  set_hensu(255,choice_mons_id);
  set_hensu(258, choiceNext);
  //以下２文は、ここに書くと使えないので、ツクールのイベントに直接書きます
	// this.setupChoices([[sentakusi[0],sentakusi[1],sentakusi[2],sentakusi[3],nextChoice,"やめる"],4,0,2,0]);　※同じスクリプトに書く事
	// this.setWaitMode('message');　上記のfuncとはスクリプトを別に分けて書く事。
  // 選択後のfuncをスクリプトで呼ぶ時に、同じスクリプト内でchoiceNo = this._branch[this._indent];を書く事。

}


//手持ち選択肢一覧から選択した時、選択された手持ちのidを返す
//patternについて、null=set_area_boss,1=合成
function have_mons_id_chose_do(pattern){
  nextChoice = get_hensu(254);
  choiceNo = get_hensu(256);
  choice_mons_id = get_hensu(255);
  choiceNext = get_hensu(258);
  var choiced_mons1 = get_switch(221);
  set_mons_id = 0;
  console.log(choiceNo);
  switch (choiceNo) {
    case 0: set_mons_id = choice_mons_id[choiceNo];console.log(choice_mons_id[choiceNo]); break;
    case 1: set_mons_id = choice_mons_id[choiceNo]; break;
    case 2: set_mons_id = choice_mons_id[choiceNo]; break;
    case 3: set_mons_id = choice_mons_id[choiceNo]; break;
    case 4: 
      if(nextChoice=="なし"){
      }
      if(nextChoice=="次へ"){
        choiceNext = 1;
      }
      if(nextChoice=="戻る"){
        choiceNext = 0;
      }; 
      break;
    default: choiceNext = 0; set_switch(222,true); break;
  };
  set_hensu(253, choiceNext);
  if(set_mons_id == 0){
    return;
  }
  if(pattern == 1){
    var hensu_id = 251;
    if(get_hensu(251) != 0){
      hensu_id = 252;
      set_switch(221, true);
    }
    set_hensu(hensu_id,set_mons_id);
    return;
  }
  set_hensu()
  return set_mons_id;
  // set_area_mons(set_mons_id);
  
}

//合成後のmons_id,enhance_valueを配列で返す
function get_gousei_after_mons(run){
  if (run == null){
    run = false;
  }
  var mons_id1 = get_hensu(251);
  var mons_id2 = get_hensu(252);
  var result = {};
  var remons = [mons_id1, mons_id2];
  result["mons_id"] = get_gousei_mons_id(mons_id1,mons_id2);
  result["enhance"] = [];
  var mons_status_1 = get_mons_status(mons_id1);
  var mons_status_2 = get_mons_status(mons_id2);
  var mons_enha_1 = mons_status_1["enhance"];
  var mons_enha_2 = mons_status_2["enhance"];
  console.log(mons_enha_1);
  for (var i = 0; i < 10; i++){
    result["enhance"][i] = mons_enha_1[i] + mons_enha_2[i];
  }
  result["enhance"][0] += get_lebel_bonus(mons_status_2["lv"]) + 1;
  if(result["mons_id"] == mons_id1){
    result["enhance"][0] += get_attri_bonus(mons_id2);
  }
  var mons_name = $gameActors.actor(result["mons_id"])._name;
  console.log(result["enhance"]);
  set_hensu(260, result["mons_id"]);
  set_hensu(261, result["enhance"][0]);
  set_hensu(262, mons_name);
  judge_have_double(result["mons_id"]);
  if (run == true){
    recall(result["mons_id"], result["enhance"], remons);
    return;
  }
  return result;
}


//モンスターの属性判定
function judge_mons_attribute(mons_id){
  var result = mons_id % 100 / 10;
  return Math.floor(result);
}
//モンスターのランク判定
function judge_mons_rank(mons_id){
  switch (mons_id % 10){
    case 1: ;
    case 2: ;
    case 3: ;
    case 4: return 1; break;
    case 5: ;
    case 6: ;
    case 7: return 2; break;
    case 8: ;
    case 9: return 3; break;
    case 0: return 4; break;
    default: return 0; break;
  }
}
//合成相手のレベルでの強化値のボーナス量
function get_lebel_bonus(mons_lv2){
  if (mons_lv2 <= 20 ) { return 0;}
  if (mons_lv2 >= 21 && mons_lv2 <= 40) { return 2;}
  if (mons_lv2 >= 41 && mons_lv2 <= 60) { return 4;}
  if (mons_lv2 >= 61 && mons_lv2 <= 80) { return 8;}
  if (mons_lv2 >= 81 && mons_lv2 <= 99) { return 16;}
  return 0;
}

//相手モンスターによって、ランクアップ、属性変化しない場合、属性によって強化値ボーナス
function get_attri_bonus(mons_id2){
  var mons_attri = judge_mons_attribute(mons_id2);
  switch (mons_attri){
    case 5: ;
    case 6: return 2; break;
    case 7: ;
    case 8: return 4; break;
    case 9: return 8; break;
    default: return 0;
  }
}





//合成後のmons_idを返す
function get_gousei_mons_id(mons_id1,mons_id2){
  var mons_attri_1 = judge_mons_attribute(mons_id1);
  var mons_attri_2 = judge_mons_attribute(mons_id2);
  var mons_rank_1 = judge_mons_rank(mons_id1);
  var mons_rank_2 = judge_mons_rank(mons_id2);
  console.log(mons_rank_1);
  console.log(mons_rank_2);
  if(mons_rank_1 == mons_rank_2 && mons_rank_1 != 4){
    //同ランク、同属性だった場合、ランク１アップしたモンスター(ランダム)になる
    console.log(mons_attri_1);
    console.log(mons_attri_2);
    if(mons_attri_1 == mons_attri_2){
      var rank_num = mons_id1 % 10 + mons_id2 % 10;
      switch(mons_rank_1 + 1){
        case 2: return mons_attri_1 * 10 + rank_num % 3 + 5;
        case 3: return mons_attri_1 * 10 + rank_num % 2 + 8;
        case 4: return mons_attri_1 * 10 + 0;
      }
    }
    //同ランク、属性が特定の組み合わせの場合、属性変化
    var attri_str = mons_attri_1 + "-" + mons_attri_2;
    if(mons_attri_1 > mons_attri_2){
      attri_str = mons_attri_2 + "-" + mons_attri_1;
    }
    //属性変化した先のランクは元モンスターのランク
    switch (attri_str) {
      case "0-1": return 5 * 10 + mons_id1 % 10; break;
      case "2-3": return 6 * 10 + mons_id1 % 10; break;
      case "4-5": return 7 * 10 + mons_id1 % 10; break;
      case "4-6": return 8 * 10 + mons_id1 % 10; break;
      case "7-8": return 9 * 10 + mons_id1 % 10; break;
      default: return mons_id1; break;
    }
  }
  //上で何もなかった時、mons_id1が返される。
  return mons_id1;

}

//召喚するmons_idが手持ちと被っていないかを判定
function judge_have_double(mons_id){
  var result = false;
  var memberCount = $gameParty.size();
  set_switch(251,false);
  console.log(memberCount);
  for (var i=0; i<memberCount; i++) {
    var party_id = $gameParty.members()[i]._actorId;
    if(party_id == mons_id){
      result = true;
    }
  }
  if(get_hensu(251) == mons_id){
    result = false;
  }
  if(result){
    set_switch(251,true);
  }
  return result;
}

//召喚符func
function recall(mons_id, enhance, remons){
  if (mons_id == null){
    var item_id = $gameParty.lastItem().id;
    mons_id = item_id - 100;
  }
  var check =  judge_have_double(mons_id);
  if(check){
    newPage_message();
    set_message("既にメンバーに居るので召喚できません。");
    return;
  }
  $gameActors.actor(mons_id).setup(mons_id);
  $gameParty.addActor(mons_id);
  var mons_name = get_actor_name(mons_id);
  newPage_message();
  set_message(mons_serif(mons_id));
  reset_mons_status(mons_id);
  if (remons != null){
    for (var i = 0; i < remons.length; i++){
      console.log("test" + remons[i]);
      reset_mons_status(remons[i]);
      remove_actor(remons[i]);
    }
  }
  add_actor(mons_id);
  set_gouseimons_status(mons_id, enhance);

}

function set_gouseimons_status(mons_id, enhance){
  var status_plus = enhance[0];
  for (var i = 0; i < 10; i++){
    add_param(mons_id, i, status_plus);
  }

}

//モンスターのステータスレベル１、enhance0に
function reset_mons_status(mons_id){
  reset_actor(mons_id);
  //スキル情報と強化値を配列としてもたせているため、配列になっている。
  var status = [0,0,0,0,0,0,0,0,0,0];
  set_hensu(mons_id+1000,status);
}

//召喚時のセリフ、初召喚判定の配列もこの時に作成しv901〜保存
function mons_serif(id){
  if(!Array.isArray(get_hensu(901))){
    var arr = [];
    for(var i=1; i<=100; i++){
      arr.push(0);
    }
    set_hensu(901,arr);
  }
  var first_look_vNo = Math.ceil(id / 100) + 900;
  var first_look_result = get_hensu(first_look_vNo[id % 100 - 1]);
  var serif = "";
  if(first_look_result){
    switch(id){
      case 1: serif = id; break;
      case 2: serif = id; break;
      case 3: serif = id; break;
      case 4: serif = id; break;
      case 5: serif = id; break;
      case 6: serif = id; break;
      case 7: serif = id; break;
      case 8: serif = id; break;
      case 9: serif = id; break;
      case 10: serif = id; break;
      case 11: serif = id; break;
      case 12: serif = id; break;
      case 13: serif = id; break;
      case 14: serif = id; break;
      case 15: serif = id; break;
      case 16: serif = id; break;
      case 17: serif = id; break;
      case 18: serif = id; break;
      case 19: serif = id; break;
      case 20: serif = id; break;
      case 21: serif = id; break;
      case 22: serif = id; break;
      case 23: serif = id; break;
      case 24: serif = id; break;
      case 25: serif = id; break;
      case 26: serif = id; break;
      case 27: serif = id; break;
      case 28: serif = id; break;
      case 29: serif = id; break;
      case 30: serif = id; break;
      case 31: serif = id; break;
      case 32: serif = id; break;
      case 33: serif = id; break;
      case 34: serif = id; break;
      case 35: serif = id; break;
      case 36: serif = id; break;
      case 37: serif = id; break;
      case 38: serif = id; break;
      case 39: serif = id; break;
      case 40: serif = id; break;
      case 41: serif = id; break;
      case 42: serif = id; break;
      case 43: serif = id; break;
      case 44: serif = id; break;
      case 45: serif = id; break;
      case 46: serif = id; break;
      case 47: serif = id; break;
      case 48: serif = id; break;
      case 49: serif = id; break;
      case 50: serif = id; break;
      case 51: serif = id; break;
      case 52: serif = id; break;
      case 53: serif = id; break;
      case 54: serif = id; break;
      case 55: serif = id; break;
      case 56: serif = id; break;
      case 57: serif = id; break;
      case 58: serif = id; break;
      case 59: serif = id; break;
      case 60: serif = id; break;
      case 61: serif = id; break;
      case 62: serif = id; break;
      case 63: serif = id; break;
      case 64: serif = id; break;
      case 65: serif = id; break;
      case 66: serif = id; break;
      case 67: serif = id; break;
      case 68: serif = id; break;
      case 69: serif = id; break;
      case 70: serif = id; break;
      case 71: serif = id; break;
      case 72: serif = id; break;
      case 73: serif = id; break;
      case 74: serif = id; break;
      case 75: serif = id; break;
      case 76: serif = id; break;
      case 77: serif = id; break;
      case 78: serif = id; break;
      case 79: serif = id; break;
      case 80: serif = id; break;
      case 81: serif = id; break;
      case 82: serif = id; break;
      case 83: serif = id; break;
      case 84: serif = id; break;
      case 85: serif = id; break;
      case 86: serif = id; break;
      case 87: serif = id; break;
      case 88: serif = id; break;
      case 89: serif = id; break;
      case 90: serif = id; break;
      case 91: serif = id; break;
      case 92: serif = id; break;
      case 93: serif = id; break;
      case 94: serif = id; break;
      case 95: serif = id; break;
      case 96: serif = id; break;
      case 97: serif = id; break;
      case 98: serif = id; break;
      case 99: serif = id; break;
      case 100: serif = id; break;
      default: serif = id;break;
    }
  }else{
    switch(id){
      case 1: serif = id; break;
      case 2: serif = id; break;
      case 3: serif = id; break;
      case 4: serif = id; break;
      case 5: serif = id; break;
      case 6: serif = id; break;
      case 7: serif = id; break;
      case 8: serif = id; break;
      case 9: serif = id; break;
      case 10: serif = id; break;
      case 11: serif = id; break;
      case 12: serif = id; break;
      case 13: serif = id; break;
      case 14: serif = id; break;
      case 15: serif = id; break;
      case 16: serif = id; break;
      case 17: serif = id; break;
      case 18: serif = id; break;
      case 19: serif = id; break;
      case 20: serif = id; break;
      case 21: serif = id; break;
      case 22: serif = id; break;
      case 23: serif = id; break;
      case 24: serif = id; break;
      case 25: serif = id; break;
      case 26: serif = id; break;
      case 27: serif = id; break;
      case 28: serif = id; break;
      case 29: serif = id; break;
      case 30: serif = id; break;
      case 31: serif = id; break;
      case 32: serif = id; break;
      case 33: serif = id; break;
      case 34: serif = id; break;
      case 35: serif = id; break;
      case 36: serif = id; break;
      case 37: serif = id; break;
      case 38: serif = id; break;
      case 39: serif = id; break;
      case 40: serif = id; break;
      case 41: serif = id; break;
      case 42: serif = id; break;
      case 43: serif = id; break;
      case 44: serif = id; break;
      case 45: serif = id; break;
      case 46: serif = id; break;
      case 47: serif = id; break;
      case 48: serif = id; break;
      case 49: serif = id; break;
      case 50: serif = id; break;
      case 51: serif = id; break;
      case 52: serif = id; break;
      case 53: serif = id; break;
      case 54: serif = id; break;
      case 55: serif = id; break;
      case 56: serif = id; break;
      case 57: serif = id; break;
      case 58: serif = id; break;
      case 59: serif = id; break;
      case 60: serif = id; break;
      case 61: serif = id; break;
      case 62: serif = id; break;
      case 63: serif = id; break;
      case 64: serif = id; break;
      case 65: serif = id; break;
      case 66: serif = id; break;
      case 67: serif = id; break;
      case 68: serif = id; break;
      case 69: serif = id; break;
      case 70: serif = id; break;
      case 71: serif = id; break;
      case 72: serif = id; break;
      case 73: serif = id; break;
      case 74: serif = id; break;
      case 75: serif = id; break;
      case 76: serif = id; break;
      case 77: serif = id; break;
      case 78: serif = id; break;
      case 79: serif = id; break;
      case 80: serif = id; break;
      case 81: serif = id; break;
      case 82: serif = id; break;
      case 83: serif = id; break;
      case 84: serif = id; break;
      case 85: serif = id; break;
      case 86: serif = id; break;
      case 87: serif = id; break;
      case 88: serif = id; break;
      case 89: serif = id; break;
      case 90: serif = id; break;
      case 91: serif = id; break;
      case 92: serif = id; break;
      case 93: serif = id; break;
      case 94: serif = id; break;
      case 95: serif = id; break;
      case 96: serif = id; break;
      case 97: serif = id; break;
      case 98: serif = id; break;
      case 99: serif = id; break;
      case 100: serif = id; break;
      default: serif = id;break;
    }
    set_hensu(first_look_vNo[id % 100 - 1],1);
  }
  return serif;
}

// DB情報をツクール変数にセットする
function area_status_set(response){
  var area_status = [];
  area_status["id"] = response.id * 1;
  area_status["name"] = response.name;
  area_status["point"] = response.point * 1;
  area_status["level"] = response.level * 1;
  area_status["users_mst_id"] = response.users_mst_id * 1;
  area_status["basic_value"] = response.basic_value * 1;
  area_status["now_value"] = response.now_value * 1;
  area_status["collection_value"] = response.collection_value * 1;
  area_status["mons_id"] = response.mons_id * 1;
  area_status["mons_lv"] = response.mons_lv * 1;
  area_status["combat_datetime"] = response.combat_datetime;
  area_status["asset_value"] = response.basic_value * Math.pow(2,response.level);
  area_status["use_value"] = area_status["asset_value"] / 3;
  area_status["challenge_value"] = area_status["asset_value"] / 2;
  area_status["acquisitions_value"] = area_status["asset_value"] * 100;
  console.log("test1");
  console.log(area_status);
  console.log(area_status["users_mst_id"]);
  set_hensu(127, area_status);
  set_hensu(130, area_status["users_mst_id"]);
  set_hensu(131, area_status["name"]);
  set_hensu(132, area_status["mons_id"]);
  var status = [];
  status[0] = response.mons_mhp;
  status[1] = response.mons_mmp;
  status[2] = response.mons_atk;
  status[3] = response.mons_def;
  status[4] = response.mons_mat;
  status[5] = response.mons_mdf;
  status[6] = response.mons_agi;
  status[7] = response.mons_luk;
  set_hensu(140, status);

}


//エリア情報を得る
function get_area_status(){
  var area_id = get_hensu(126);
  var postData = JSON.stringify({"area_id":area_id});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  //登録できたか否かの結果メッセージを変数101に入れ、イベントで表示できる様にしている
                  console.log(area_id);
                  console.log(response);
                  area_status_set(response);
                  
                }else{
                  console.log("その他の応答:"+xmlhr.status);

                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/get_area_status");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}
//資産価値
function set_asset_value(){
  // var basic_value = get_hensu(129);
  // var level = get_hensu(128);
  // var next_collection = basic_value * Math.pow(2,level);
  // $gameVariables.setValue(132,next_collection);

}

//投資
function investment(){
  var area_id = get_hensu(126);
  var user_id = get_hensu(101);
  var postData = JSON.stringify({"area_id":area_id,"user_id":user_id});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  area_status_set(response);
                  var message = "有難う御座います。拠点レベルが" + response.level + "に上がりました";
                  set_hensu(501, message);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/investment");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//買収
function acquisitions(){
  var area_id = get_hensu(126);
  var user_id = get_hensu(101);
  var postData = JSON.stringify({
    "area_id":area_id,
    "user_id":user_id
  });
  console.log(postData);
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  add_profit();
                  area_status_set(response);
                  

                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/acquisitions");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}
//支配
function occupation(mons_id){
  var area_id = get_hensu(126);
  var user_id = get_hensu(101);
  var mons_status = get_mons_status(mons_id);
  var mons_lv = mons_status["lv"];
  var mons_mhp = mons_status["mhp"];
  var mons_hp = mons_status["mhp"];
  var mons_mmp = mons_status["mmp"];
  var mons_atk = mons_status["atk"];
  var mons_def = mons_status["def"];
  var mons_mat = mons_status["mat"];
  var mons_mdf = mons_status["mdf"];
  var mons_agi = mons_status["agi"];
  var mons_luk = mons_status["luk"];
  var mons_enhance = enhance_to_string(mons_status["enhance"]);
  var postData = JSON.stringify({
                                "area_id" : area_id, 
                                "user_id" : user_id, 
                                "mons_id" : mons_id,
                                "mons_lv" : mons_lv,
                                "mons_mhp" : mons_mhp,
                                "mons_hp" : mons_hp,
                                "mons_mmp" : mons_mmp,
                                "mons_atk" : mons_atk,
                                "mons_def" : mons_def,
                                "mons_mat" : mons_mat,
                                "mons_mdf" : mons_mdf,
                                "mons_agi" : mons_agi,
                                "mons_luk" : mons_luk,
                                "mons_enhance" : mons_enhance
                                });
  console.log(postData);
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  area_status_set(response);
                  

                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/occupation");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//利益の追加
function add_profit(){
  var profit = get_hensu(152);
  var user_id = get_hensu(130);
  var postData = JSON.stringify({"profit":profit,"user_id":user_id});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);

                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/add_profit");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//利益を回収する
function get_profit(collect){
  if (collect) {
      collect = true;
    }else{
      collect = false;
    }
  var user_id = get_hensu(101);
  var postData = JSON.stringify({"user_id":user_id,"collect":colect});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  $gameVariables.setValue(136,response.profit);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/get_profit");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//DBのareaからuserへ、所有する資産価値をセット
function set_user_asset(){
   //データ転送はダミー
  var user_id = get_hensu(101);
  var postData = JSON.stringify({"user_id":user_id});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  var response = JSON.parse(xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  $gameVariables.setValue(136,response.profit);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/set_user_asset");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}
//ランキングを全てのユーザー規模で取得
function get_all_user_ranking(){
  var user_id = get_hensu(101);
  var postData = JSON.stringify({"user_id":user_id});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  var ranking = response[user_id];
                  
                  $gameVariables.setValue(1001,ranking.total_asset);
                  $gameVariables.setValue(1002,ranking.rank);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/get_all_user_ranking");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//現在の貯金額を取得
function get_savings(){
  var user_id = get_hensu(101);
  var postData = JSON.stringify({"user_id":user_id});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  $gameVariables.setValue(137,response.savings);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/get_savings");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}



//貯金をする
function add_savings(){
  var user_id = get_hensu(101);
  var savings = get_hensu(138);
  var postData = JSON.stringify({"user_id":user_id,"savings":savings});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  $gameVariables.setValue(137,response.savings);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/add_savings");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//貯金を引き出す
function takeout_savings(){
  var user_id = get_hensu(101);
  var takeout = get_hensu(138);
  var postData = JSON.stringify({"user_id":user_id,"takeout":takeout});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  $gameSwitches.setValue(202,true);
                  var response = JSON.parse(xmlhr.responseText);
                  $gameVariables.setValue(139,response.savings);
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/takeout_savings");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

function set_playtime(){
  var user_id = get_hensu(101);
  var playtime = 0;
  var postData = JSON.stringify({"user_id":user_id,"playtime":playtime});
  xmlhr.onreadystatechange = function(){
          console.log('changestart');
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  
                }
              }
              break;
          }
  };
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/set_playtime");
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}

//エリアボスとして、指定id,ステータスを登録する
function set_area_mons(mons_id){
  var area_id = get_hensu(126);
  user_id = get_hensu(101);
  mons_lv = $gameActors.actor(mons_id).level;
  mons_mhp = $gameActors.actor(mons_id).mhp;
  mons_mmp = $gameActors.actor(mons_id).mmp;
  mons_atk = $gameActors.actor(mons_id).atk;
  mons_def = $gameActors.actor(mons_id).def;
  mons_mat = $gameActors.actor(mons_id).mat;
  mons_mdf = $gameActors.actor(mons_id).mdf;
  mons_agi = $gameActors.actor(mons_id).agi;
  mons_luk = $gameActors.actor(mons_id).luk;
  s_mons_enhance = get_hensu(mons_id + 1000);
  var mons_enhance = "";
  for (var i = 0; i < s_mons_enhance.length; i++) {
    mons_enhance += s_mons_enhance[i];
    if(i != s_mons_enhance.length - 1){
      mons_enhance += ",";
    }
  }
  mons_enhance = s_mons_enhance[mons_id];
  var dateObj = new Date();
  var combat_datetime = Math.floor(dateObj.getTime / 1000);
  var json_mons_status = {
  	"area_id" : area_id,
  	"user_id" : user_id,
    "mons_id" : mons_id,
    "mons_lv" : mons_lv,
    "mons_mhp" : mons_mhp,
    "mons_hp" : mons_mhp,
    "mons_atk" : mons_atk,
    "mons_def" : mons_def,
    "mons_mat" : mons_mat,
    "mons_mdf" : mons_mdf,
    "mons_agi" : mons_agi,
    "mons_luk" : mons_luk,
    "mons_enhance" : mons_enhance,
    "combat_datetime" : combat_datetime
  }
  var postData = JSON.stringify(json_mons_status);
	xmlhr.onreadystatechange = function(){
		switch(xmlhr.readyState){
			case 4:
				if(xmlhr.status == 0){
					console.log('通信失敗');
				}else{
					if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
						console.log("受信:"+xmlhr.responseText);
						var response = JSON.parse(xmlhr.responseText);
						$gameVariables.setValue(101,response.message);
						$gameParty.removeActor(mons_id);
						
						set_area_mons_skill(mons_id,area_id);

					}else{
						console.log("その他の応答:"+xmlhr.status);
						$gameVariables.setValue(101,"通信失敗");
					}
				}
				break;
		}
	};
	
	xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/set_area_mons");
	xmlhr.setRequestHeader('Content-Type', 'application/json');
	xmlhr.send(postData);
}

//エリアボスのスキル登録
function set_area_mons_skill(mons_id,area_id){
	var skill_array = $gameActors.actor(mons_id)._skills;
	var skill_count = 0;
	var json_skill_list = {};
	json_skill_list["area_id"] = area_id;
	for(var i in skill_array){
		json_skill_list[i] = skill_array[i];
		skill_count++;
	}
	json_skill_list["skill_count"] = skill_count;
	var postData = JSON.stringify(json_skill_list);
	console.log(postData);
	xmlhr.onreadystatechange = function(){
		switch(xmlhr.readyState){
			case 4:
				if(xmlhr.status == 0){
					console.log('通信失敗');
				}else{
					if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
						console.log("受信:"+xmlhr.responseText);
						var response = JSON.parse(xmlhr.responseText);
						$gameVariables.setValue(101,response.message);
						

					}else{
						console.log("その他の応答:"+xmlhr.status);
						$gameVariables.setValue(101,"通信失敗");
					}
				}
				break;
		}
	}
	xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/set_area_mons_skill");
	xmlhr.setRequestHeader('Content-Type', 'application/json');
	xmlhr.send(postData);

}



//指定IDのステータスを取得
function get_mons_status(mons_id){
  var mons_status = [];
  mons_status["lv"] = $gameActors.actor(mons_id).level;
  mons_status["mhp"] = $gameActors.actor(mons_id).mhp;
  mons_status["mmp"] = $gameActors.actor(mons_id).mmp;
  mons_status["atk"] = $gameActors.actor(mons_id).atk;
  mons_status["def"] = $gameActors.actor(mons_id).def;
  mons_status["mat"] = $gameActors.actor(mons_id).mat;
  mons_status["mdf"] = $gameActors.actor(mons_id).mdf;
  mons_status["agi"] = $gameActors.actor(mons_id).agi;
  mons_status["luk"] = $gameActors.actor(mons_id).luk;
  //スキル情報と強化値を配列としてもたせているため、配列になっている。
  var mons_enhance = get_enhance(mons_id);
  set_hensu(mons_id+1000,mons_enhance);
  mons_status["enhance"] = mons_enhance;
  return mons_status;
	// mons_lv = $gameActors.actor(mons_id).level;
	// mons_mhp = $gameActors.actor(mons_id).mhp;
	// mons_mmp = $gameActors.actor(mons_id).mmp;
	// mons_atk = $gameActors.actor(mons_id).atk;
	// mons_def = $gameActors.actor(mons_id).def;
	// mons_mat = $gameActors.actor(mons_id).mat;
	// mons_mdf = $gameActors.actor(mons_id).mdf;
	// mons_agi = $gameActors.actor(mons_id).agi;
	// mons_luk = $gameActors.actor(mons_id).luk;
	// s_mons_enhance = get_hensu(mons_id+1000);
 //    mons_enhance = s_mons_enhance[0];
	
}

//エリアボスのステータスを取得して反映する（１体）
//$gameTroop.members()[0].addParam(2,100);
function get_areaBoss_status(area_id){
  var method = "get_areaBoss_status";
  var postData = {"area_id":area_id};
  var result = get_server_data(postData, method);

}

function testHp(){
  var num = 1000;
  $gameTroop.members()[0].addParam(0,-num);
}

//this.changeHp($gameTroop.members()[0], 1000, false); メモ
function update_areaBoss_hp(){
  var method = "get_areaBoss_hp";
  var area_id = get_hensu(126);
  var postData = {"area_id":area_id};
  var response;
  set_switch(202,false);
  postData = JSON.stringify(postData);
  xmlhr.onreadystatechange = function(){
          switch(xmlhr.readyState){
            case 4:
              if(xmlhr.status == 0){
                console.log('通信失敗');
              }else{
                if((200 <= xmlhr.status&&xmlhr.status<300)||(xmlhr.status==304)){
                  console.log("受信:"+xmlhr.responseText);
                  set_switch(202,true);
                  response = JSON.parse(xmlhr.responseText);
                  var nowHp = $gameTroop.members()[0].hp;
                  console.log("dbHp=" + response["mons_hp"]);
                  //現HPよりDBhpが小さいなら、HPを変更。DBが大きいなら、DBを更新する。
                  if (nowHp > response["mons_hp"]){
                    console.log("dbNoUpdate");
                    console.log(nowHp);
                    var minusHp = nowHp - response["mons_hp"];
                    console.log(-minusHp);
                    if (response["mons_hp"] == 0) {
                      minusHp -= 1;
                    }
                    $gameTroop.members()[0].gainHp(-minusHp);
                    nowHp = $gameTroop.members()[0].hp;
                    console.log(nowHp);
                  }else{
                    console.log("dbupdate");
                    console.log(nowHp);
                    set_areaBoss_hp(nowHp);
                  }
                  
                }else{
                  console.log("その他の応答:"+xmlhr.status);
                  $gameVariables.setValue(501,"通信失敗");
                  response = null;
                  return 
                }
              }
              break;
          }
  };
  
  xmlhr.open("POST","http://yatsurecreate.com/api/public/apitest/" + method);
  xmlhr.setRequestHeader('Content-Type', 'application/json');
  xmlhr.send(postData);
}
//１体前提、上のfuncで使用
function set_areaBoss_hp(boss_hp){
  var method = "set_areaBoss_hp";
  var area_id = get_hensu(126);
  var mons_hp = boss_hp;
  var postData = {"area_id":area_id,"mons_hp":mons_hp};
  var response;
  set_switch(202,false);
  action_server_ajax(postData, method);
}

function set_areaBoss_status(){
  var erea_status = get_hensu(127);
  var boss_status = get_hensu(140);
  if (erea_status["mons_id"] == 1001){
    return;
  }
  for (var i = 0; i < 8; i++) {
    $gameTroop.members()[0].addParam(i, boss_status[i]);
  }
}



//エリアボスの現在HPを取得する



// メッセージイベント
// 変数201
// （mons1にmons2を合成すると
// mons3＋〜になるぞ）

// メッセージイベント
// 本当に合成するか？

// 選択肢イベント
// はい
// ウェイト
// フラッシュ＋効果音
//合成実行
// function gousei_do(gousei_mons_3){
//     仲間からmons1、mons2外す
//     mons3を初期化して加える
//     gousei_mons_3[1]の分、全ステータスを＋

// }
// いいえ
// イベント始めへラベルジャンプ


// var menber_actor_id_array = [];
// var menber_check = false;
// ・メンバーに既にいるかのチェックスイッチを作る
// 召喚符func
//召喚符で召喚する時のfunc
// function summons_execut(mons_id){
//     menber_actor_id_array = 現在のパーティーid;
//     if(menber_actor_id_array.indexOf(mons_id) >= 0){
//         メッセージ変数 = 既にメンバーに居るので召喚できません。
//         メンバーチェックスイッチ＝ture;
//         return;
//     }
//     // 効果音
//     // 仲間に追加（初期化）
// }




//エリアボスのスキル情報をゲットし、スキルをセットするfunc
//※敵のスキル情報をいじるスクリプトを調査する必要がある
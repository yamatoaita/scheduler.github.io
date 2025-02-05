import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push,  get, set, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";


class SiteSyste{
    constructor(){
        try{
            const firebaseConfig = {
                apiKey: "AIzaSyBK76pZI4Kee5amJqHb1t-phYawpBpGxJU",
                authDomain: "adjuster-5f483.firebaseapp.com",
                databaseURL: "https://adjuster-5f483-default-rtdb.firebaseio.com",
                projectId: "adjuster-5f483",
                storageBucket: "adjuster-5f483.firebasestorage.app",
                messagingSenderId: "64517786525",
                appId: "1:64517786525:web:904a63dd6745c44cffbd74"
            };
            const app = initializeApp(firebaseConfig);
            this.db = getDatabase(app);
            this.dbRef_cookie =  ref(this.db, `data/cookie`);

            const urlParams = new URLSearchParams(window.location.search);
            this.user_index = urlParams.get("user_index");
            if(this.user_index != "admin" && this.user_index !="user" && this.user_index != "ref"){
                this.user_index = "user";
            }

            this.page_setting();

            this.invalid_cell_color = "rgb(176, 176, 176)";
            this.suitable_day_color = "rgb(222, 157, 14)";

            this.data_set_initialize();
            this.data_dict = {};

            this.enter_btn = document.getElementById("enter");

            get(this.dbRef_cookie).then((snapshot) => {
                if (snapshot.exists()) {//パスワードが登録されていた場合
                    this.data = snapshot.val();//データを格納
                    this.data = JSON.parse(this.data);
                    
                    let cookie_date = new Date(this.data[0]); // cookie_dateを格納
                    let current_date = new Date(); // 現在の時刻を取得

                    // cookie_dateから現在時刻までの経過時間をミリ秒で取得
                    let elapsed_time = current_date - cookie_date; 
                    var page_index = document.getElementById("page_index");
                    //console.log(elapsed_time);
                    if(page_index.textContent == "ref"){
                        this.ref_system();
                    }else{
                        if (elapsed_time >= 3000) {
                            
                            if(page_index.textContent == "adjust" ){
                                window.location.href = `index.html?user_index=${this.user_index}`;
                            }else{
                                this.index_system();
                            }
                            //this.adjust_system();
                        } else {
                            this.adjust_system();
                        }
                    }
                
                } else {
                    this.index_system();
                }
            });
        }catch(error){
            alert(error);
        };
    };

    page_setting(){
        if(this.user_index == "admin"){
            /*
            backgroundImage = "url('admin_wall_withtext.png')";
            element.style.backgroundRepeat = "repeat"; // 繰り返しを防止
            element.style.backgroundSize = "cover"; // 画面全体に広げる
            element.style.backgroundPosition = "center"; // 中央に配置
            画像を使いたいときの書き方
            */
            var element = document.body;
            element.style.backgroundColor = `rgb(128, 212, 202)`;
            var text = "日程を編集する時は名前を入力してください<br>【例 : 貴方名前】<br><br>日程調整の結果を確認する時は【251日程照合】と入力してください";
            text = text.replace("【251日程照合】",`<span style="color: rgb(161, 16, 16); font-weight: bold;";><br>【日程照合】</span>`);
            text = text.replace("【例 : 貴方名前】",`<span style="color: rgb(161, 16, 16); font-weight: bold;";>【例 : 貴方名前】</span>`);
            
            document.getElementById("explain").innerHTML=text;
            document.getElementById("explain").style.fontSize="13px";
        }else if(this.user_index == "ref"){
            var element = document.body;
            element.style.backgroundColor = "rgb(172, 214, 254)";
            element.style.backgroundImage = "url('search.png')";
            element.style.backgroundRepeat = "no-repeat"; // 繰り返しを防止
            element.style.backgroundSize = "500px"; // 画面全体に広げる
            element.style.backgroundPosition = "-40px 120px"; // 中央に配置
        }
    }
    //***********************************************************
    index_system(){
        try{
            this.entry = document.getElementById("entry");
            this.entrybtn = document.getElementById("entrybtn");
            this.entrybtn.addEventListener("click",()=>{
                this.trim();
                this.are_data();
            })
        }catch(error){
            alert(
                "エラーが発生しました！ 會田までこれをコピペ（またはスクショ）してお知らせください。 \n" +
                "メッセージ: " + error.message + "\n" +
                "エラーの種類: " + error.name + "\n" +
                "発生場所: \n" + error.stack
            );
        }

    }

    trim(){
        this.target = this.entry.value;
        this.target = this.target.replace(/[\s\u3000]/g,"");
        this.dbRef_name =  ref(this.db, `data/${this.user_index}/${this.target}`);
    }

    are_data(){//【➡constracter】
        get(this.dbRef_name).then((snapshot) => {
            if (snapshot.exists()) {//パスワードが登録されていた場合
                this.data = snapshot.val();//データを格納
                //console.log(`there are data: ${this.data}`)
                this.link();
            } else {//パスワードが存在しなかった場合
                //console.log("No data");
                if(this.target != "日程照合"){
                    var today = new Date();
                    var year = today.getFullYear();
                    var month = today.getMonth()+1;
            
                    this.data_set_initialize();
                    this.data_dict[`${year}年${month}月`] = this.data_set;
                    var JSON_data = JSON.stringify(this.data_dict);
                    set(this.dbRef_name,JSON_data);//Google Firebaseにデータを保存（key, data）
                }
                this.link();
            }
        });   
    }

    link(){
        const expires = new Date();
        expires.setTime(expires.getTime());
        /*document.cookie = `passward = ${user_data};path=/; expires=${expires.toUTCString()}`;*/
        var cookie_list = JSON.stringify([expires,this.target]);
        set(this.dbRef_cookie,cookie_list);
        
        if(this.target == "日程照合"){
            window.location.href = `ref.html?user_index=ref`;
        }else{   
            window.location.href = `adjust.html?user_index=${this.user_index}`;
        }

    }

    //***********************************************************
    make_allO_data(){
        var init_data = "〇";
        var index = 0;
        var allO_data = [//month
            [//day
                [init_data,index],//morning
                [init_data,index],//day 
                [init_data,index]//night
            ],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]]//×32 days
        ];

        return allO_data;
    }

    data_set_initialize(index_arg = ""){
        if(this.user_index == "user"){
            var index = 0;
            var init_data = "Nan";
        }else if(this.user_index == "admin"){
            var index = 1;
            var init_data = "Nan";
        }else if(this.user_index == "ref"){
            var index = 1;
            var init_data = "Nan";
        }

        if(index_arg){
            index = index_arg;
            init_data = "✕";
        }

        this.data_set =[//month
            [//day
                [init_data,index],//morning
                [init_data,index],//day 
                [init_data,index]//night
            ],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]],
            [[init_data,index], [init_data,index], [init_data,index]]//×32 days
        ];
    }

    ref_system(){
        try{
            var dbRef_user = ref(this.db,"data/user");
            this.entry = document.getElementById("entry");
            get(dbRef_user).then((snapshot) => {
                if (snapshot.exists()) {//パスワードが登録されていた場合
                    var username = snapshot.val();//データを格納
                    for(let key in username){
                        var newOption = document.createElement("option");
                        newOption.value = key;
                        newOption.textContent = key;
                        this.entry.appendChild(newOption);
                    }
                    
                    
                    //console.log(`there are data: ${this.data}`)
                    
                    this.entry_btn =  document.getElementById("entrybtn");
                    this.entry_btn.addEventListener("click",()=>{
                        this.get_data();
                    })
                }
            });
        }catch(error){
            alert(
                "エラーが発生しました！ 會田までこれをコピペ（またはスクショ）してお知らせください。 \n" +
                "メッセージ: " + error.message + "\n" +
                "エラーの種類: " + error.name + "\n" +
                "発生場所: \n" + error.stack
            );
        }
    }

    adjust_system(){
        //console.log("IN ADJUST SYS")
        try{
            if(this.user_index=="admin"){
                document.getElementById("explain").innerHTML = `都合のよい日を選択してください。\n`;
            }
            this.get_data();
        }catch(error){
            alert(
                "エラーが発生しました！ 會田までこれをコピペ（またはスクショ）してお知らせください。 \n" +
                "メッセージ: " + error.message + "\n" +
                "エラーの種類: " + error.name + "\n" +
                "発生場所: \n" + error.stack
            );
        }
    }

    get_data(){
        if(this.user_index=="ref"){
            //console.log(this.entry.textContent);
            this.dbRef_userdata = ref(this.db,`data/user/${this.entry.value}`);
            //console.log(`data/user/${this.entry.textContent}`)
        }else{
            this.dbRef_userdata =  ref(this.db, `data/${this.user_index}/${this.data[1]}`);
            //console.log(`data/${this.user_index}/${this.data[1]}`)
        }
        get(this.dbRef_userdata).then((snapshot) => {
            if (snapshot.exists()) {//パスワードが登録されていた場合
                //console.log(snapshot.val());
                this.data_dict = JSON.parse(snapshot.val());
            }  
        

            this.dbRef_admindata = ref(this.db,`data/admin`);
            get(this.dbRef_admindata).then((snapshot)=>{
                if(snapshot.exists()){
                    this.admin_data = [];
                    this.admin_objects = snapshot.val();
                    for(let item in this.admin_objects){
                       this.admin_data.push(JSON.parse(this.admin_objects[item]));
                    }
                }else{
                    this.admin_data = [];
                }

                
                this.make_admin_dict(); //管理者が互いに都合の良い日を集めたdictionary型を作る
                console.table(this.MatuallySuitableDate_dict[`2025年2月`])
                this.set_panels();
            })
        })
    }

    make_admin_dict(){
        try{
            
            var ref_keys = [];
            var common_keys = [];
            var first_dict_flg = 1;
            var key = "";
            if(this.admin_data.length==1){
                for(key in this.admin_data[0]){
                    common_keys.push(key);
                }

                var allO_data = this.make_allO_data();
                for(let i = 0 ; i < common_keys.length; i++){
                    var dummy_dict = {};
                    dummy_dict[common_keys[i]] = allO_data;
                    console.table(dummy_dict);
                    this.admin_data[1] = dummy_dict; 
                }
            }else{
                //共通しないkey(年月)のデータは全て編集不可にする
                for(let i = 0; i <= this.admin_data.length; i++ ){//共通するkeyをcommon_keysに取得
                    for(let key in this.admin_data[i]){
                        
                        if(first_dict_flg){
                            ref_keys.push(key);
                        }else{
                            if(ref_keys.includes(key)){
                                common_keys.push(key);
                            }
                        }
                    }
                    first_dict_flg = 0;
                }
            }
            //console.table(this.admin_data);

            var ref_cell_data = "";
            this.MatuallySuitableDate_dict = {};
            var MatuallySuitableDate_flg = 0;
            var InitCommonKey_flg = 1;
            
            var pure_cnt = 1;

            for(let key_index = 0; key_index < common_keys.length; key_index++){
                this.data_set_initialize(1);
                this.MatuallySuitableDate_dict[common_keys[key_index]] = this.data_set;//common keyをセットして、データの初期化
                //console.table(this.MatuallySuitableDate_dict[common_keys[key_index]]);
            }
        
            for(let row_index = 0; row_index<=31;row_index++){//行➡
                for(let column_index = 0; column_index<=2; column_index++){//列↓
                    
                    for(let key_index = 0; key_index < common_keys.length; key_index++){//common keyを一つずつ参照する
                        //console.table(this.MatuallySuitableDate_dict)
                        first_dict_flg = 1;
                        for(let dict_index = 0; dict_index<this.admin_data.length; dict_index++){//admin dictを一つずつ参照する
                            //console.table(this.admin_data[dict_index][common_keys[key_index]]);
                            var cells = [];
                            MatuallySuitableDate_flg = 0;
                                if(first_dict_flg){
                                    ref_cell_data = this.admin_data[dict_index][common_keys[key_index]][row_index][column_index][0];
                                    first_dict_flg = 0;
                                }else{
                                    
                                    if(ref_cell_data=="〇" && ref_cell_data == this.admin_data[dict_index][common_keys[key_index]][row_index][column_index][0]){
                                        MatuallySuitableDate_flg = 1;
                                        //this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][0] = "〇";
                                        //this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][1] = 0;//編集可能に変更
                                    }else{
                                        MatuallySuitableDate_flg = 0;
                                        //this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][0] = "✕";       
                                        //this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][1] = 1;
                                    }
                                    
                            }
                            cells.push(this.admin_data[dict_index][common_keys[key_index]][row_index][column_index][0]);

                        }

                        //admin dictを一つずつ調べ終わったら
                        if(MatuallySuitableDate_flg){
                            MatuallySuitableDate_flg = 0;
                            var try_target = this.data_dict[common_keys[key_index]];
                            if(Array.isArray(try_target)){
                                this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][0] = this.data_dict[common_keys[key_index]][row_index][column_index][0];
                            }else{
                                this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][0] = "";
                            }
                            
                            if(this.user_index=="ref"){
                                this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][1] = 1;//編集不可にする
                            }else{
                                this.MatuallySuitableDate_dict[common_keys[key_index]][row_index][column_index][1] = 0;//編集可能に変更
                            }
                            
                        }

                        pure_cnt+=1;
                        //console.table(this.MatuallySuitableDate_dict[common_keys[key_index]]);
                    }
                    
                }
            }

        /*
            
        */
        //console.table(this.MatuallySuitableDate_dict)
        }catch(error){
            alert(
                "エラーが発生しました！ 會田までこれをコピペ（またはスクショ）してお知らせください。 \n" +
                "メッセージ: " + error.message + "\n" +
                "エラーの種類: " + error.name + "\n" +
                "発生場所: \n" + error.stack
            );
        }
   
    }

    set_panels(){
        try{
            //console.table(this.MatuallySuitableDate_dict[`2025年1月`]);
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth();

            this.check_cells = [];

            this.key_year = year;
            this.key_month = month+1;

            if(this.user_index!="admin"){
                this.data_dict = this.MatuallySuitableDate_dict;
            } 

            //各セル要素にデータを入力、または初期化
            if(Array.isArray(this.data_dict[`${this.key_year}年${this.key_month}月`])){
                
                var cell = "";
                var column_list = ["morning","day","night"];
            
                var value = "";
                for(let row_index = 0; row_index<=31;row_index++){
                    for(let column_index = 0; column_index<=2; column_index++){
                        cell = document.getElementById(`row${row_index+1}_${column_list[column_index]}`);
                        value = this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][0];
                        if(value=="Nan"){
                            value = "";
                        }

                        cell.textContent = value;
                        cell.style.color = " rgb(0, 0, 0)";
                        
                        if(this.user_index != "admin" && this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][1]){
                            if(this.user_index=="ref" && this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][0]=="〇"){
                                cell.style.color = this.suitable_day_color;
                            }else{
                                cell.style.color = this.invalid_cell_color;
                            }
                        }

                        if(value==""){
                            //console.log(`this is cell(${row_index+1},${column_index+1}) index ${this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][1]}\n data ${cell.textContent}\ncolor is ${window.getComputedStyle(cell).color}`);
                
                            this.check_cells.push([row_index,column_index,cell]);
                        }
                    }
                }
                
            }else{
                this.data_dict[`${this.key_year}年${this.key_month}月`] = this.data_set;
            }

            this.add_MonthSwitchingEvent();

            this.add_BatchColumnSwitching();
            //一括列切り替えイベントを設置する。

            this.add_CellClickEvent();
            //セルクリックイベントの設置

            this.set_RowLabels_BatchRowSwitching();
            //1列目。行ラベルを設定する。また、一括行切り替えイベントも設置する。
  
            


        }catch(error){
            alert(
                "エラーが発生しました！ 會田までこれをコピペ（またはスクショ）してお知らせください。 \n" +
                "メッセージ: " + error.message + "\n" +
                "エラーの種類: " + error.name + "\n" +
                "発生場所: \n" + error.stack
            );
        }
    }


    add_BatchColumnSwitching(){
        //列一括切り替え
        var morning_column = document.getElementById("th_morning");
        var day_column = document.getElementById("th_day");
        var night_column = document.getElementById("th_night");

    
        morning_column.addEventListener("click",()=>{
            for(let r = 1; r <= 32; r++){
                var header_A = document.getElementById(`row_th${r}`);
                if(header_A.textContent != ""){
                    var cell = document.getElementById(`row${r}_morning`);
                    this.setting_event(cell,0,r-1);
                } 
            }
        })

        day_column.addEventListener("click",()=>{
            for(let r = 1; r <= 32; r++){
                var header_A = document.getElementById(`row_th${r}`);
                if(header_A.textContent != ""){
                    var cell = document.getElementById(`row${r}_day`);
                    this.setting_event(cell,1,r-1);
                } 
            }
        })

        night_column.addEventListener("click",()=>{
            for(let r = 1; r <= 32; r++){
                var header_A = document.getElementById(`row_th${r}`);
                if(header_A.textContent != ""){
                    var cell = document.getElementById(`row${r}_night`);
                    this.setting_event(cell,2,r-1);
                } 
            }
        })
        

    
    }
    
    add_CellClickEvent(){
        const SELECTED_DATE = document.getElementById("month").textContent;
        
        const DATES_LIST = SELECTED_DATE.split("年");
        DATES_LIST[1] = DATES_LIST[1].replace("月","");
        
        const CURRENT_MONTH_DATES = new Date(DATES_LIST[0],DATES_LIST[1]-1,0).getDate();

        console.log(`valid row cnt is ${CURRENT_MONTH_DATES}`);
        var moring_cell = "";
        var day_cell = "";
        var night_cell = "";

        for(let i = 1; i <= CURRENT_MONTH_DATES; i++){//Add click event
            moring_cell = document.getElementById(`row${i}_morning`);
            day_cell = document.getElementById(`row${i}_day`);
            night_cell = document.getElementById(`row${i}_night`);

            console.log(` ${i}行目を表示。 `)
            moring_cell.addEventListener("click",(event)=>{
                
                var target_color = window.getComputedStyle(event.target).color;
                //console.log(`cell name ${event.target.id}\ncolor is ${target_color}`);
                if(target_color != this.invalid_cell_color && target_color != this.suitable_day_color){
                    var id = event.target.id.match(/\d+/g).map(Number) -1
                    this.setting_event(event.target,0,id);
                }
            })
            

            
            day_cell.addEventListener("click",(event)=>{
                var target_color = window.getComputedStyle(event.target).color;
                //console.log(`cell name ${event.target.id}\ncolor is ${target_color}`);
                if(target_color != this.invalid_cell_color && target_color != this.suitable_day_color){
                    var id = event.target.id.match(/\d+/g).map(Number) -1
                    this.setting_event(event.target,1,id);
                }
            })
               
            
           
            night_cell.addEventListener("click",(event)=>{
              
                var target_color = window.getComputedStyle(event.target).color;
                //console.log(`cell name ${event.target.id}\ncolor is ${target_color}`);
                if(target_color != this.invalid_cell_color && target_color != this.suitable_day_color){
                    var id = event.target.id.match(/\d+/g).map(Number) -1
                    this.setting_event(event.target,2,id);
                }
            })
            
        }
    }

    add_MonthSwitchingEvent(){
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth();
        var div_month = document.getElementById("month");

        div_month.textContent = `${year}年${month+1}月`;

        var before_btn = document.getElementById("before");
        before_btn.addEventListener("click",()=>{
            this.before();
        })
        var after_btn = document.getElementById("next");
        after_btn.addEventListener("click",()=>{
            this.next();
        })
    }

    set_RowLabels_BatchRowSwitching(){
        const CURRENT_MONTH_LABEL = document.getElementById("month");
        const CURRENT_DATE_LIST  = CURRENT_MONTH_LABEL.textContent.split("年");
        //console.table(CURRENT_DATE_LIST);
        var year = CURRENT_DATE_LIST[0];
        var month = CURRENT_DATE_LIST[1].replace("月","");
        var date = new Date(year,month,1);

        var daysOfWeek = ["日","月","火","水","木","金","土"]
        var row_th = "";
        var month = date.getMonth();

        for(let i = 1 ; i <= 32; i++){//setting A列
           
            if(date.getMonth() == month){
                //console.log(`const month is ${month}, and current one is ${date.getMonth()}`)
                row_th = document.getElementById(`row_th${i}`);
                row_th.textContent = `${daysOfWeek[date.getDay()]}
                ${i}`;
                date.setDate(date.getDate() + 1);

                row_th.addEventListener("click",(event)=>{//一気に一行切り替える
                    var cell = event.target;
                    var id = cell.id.match(/\d+/g).map(Number);

                    var morning_cell = document.getElementById(`row${id}_morning`);
                    var day_cell = document.getElementById(`row${id}_day`);
                    var night_cell = document.getElementById(`row${id}_night`);

                    this.setting_event(morning_cell,0,id-1);
                    this.setting_event(day_cell,1,id-1);
                    this.setting_event(night_cell,2,id-1);
                });

   
            }else{
                row_th = document.getElementById(`row_th${i}`);
                row_th.textContent = "";
            }
        }
    }

    setRowLabels(){
        const CURRENT_MONTH_LABEL = document.getElementById("month");
        const CURRENT_DATE_LIST  = CURRENT_MONTH_LABEL.textContent.split("年");
        console.table(CURRENT_DATE_LIST);
        var year = CURRENT_DATE_LIST[0];
        var month = CURRENT_DATE_LIST[1].replace("月","");
        var date = new Date(year,month-1,1);

        var daysOfWeek = ["日","月","火","水","木","金","土"]
        var row_th = "";
        var month = date.getMonth();

        for(let i = 1 ; i <= 32; i++){//setting A列
           
            if(date.getMonth() == month){
                //console.log(`const month is ${month}, and current one is ${date.getMonth()}`)
                row_th = document.getElementById(`row_th${i}`);
                row_th.textContent = `${daysOfWeek[date.getDay()]}
                ${i}`;
               
                date.setDate(date.getDate() + 1);
    
            }else{
                row_th = document.getElementById(`row_th${i}`);
                row_th.textContent = "";
            }
        }
    }
    //-------------------------------------------------------------------------

    setting_event(cell, column, row){
        if(this.user_index != "ref"){
            var computedStyle = window.getComputedStyle(this.enter_btn);
            var target_color = computedStyle.backgroundColor;
            if(target_color == "rgba(104, 108, 28, 0.33)"){
                this.enter_btn.style.backgroundColor =' rgba(104, 108, 28)';
                this.enter_btn.addEventListener("click",()=>{
                    this.send_data();
                },{once:true});
            }
        }

        var current_cell = cell;
        var target = current_cell.textContent;
       
        var row_index =  row; 
        var column_index = column;
        console.log(`this is cell(${row_index+1},${column_index+1}) and index is ${this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][1]}`)
        
        const CELL_COLOR = window.getComputedStyle(cell).color;
        var isEditable = false;
        if(CELL_COLOR == 'rgb(0, 0, 0)'){
            isEditable =  true;
        }
        console.log(`COLOR IS ${CELL_COLOR}, and boolean is ${isEditable}`);

        if(isEditable){
            if(target==""|target=="✕"){
                current_cell.textContent = "〇";
                this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][0] = "〇";
            }else{
                current_cell.textContent = "✕";
                this.data_dict[`${this.key_year}年${this.key_month}月`][row_index][column_index][0] = "✕";
            }
        }

        
        ////console.table(this.data_dict[`${key_year}年${key_month}月`]);
    }

    unified_month_process(){
        var month = document.getElementById("month");
        var current_date = month.textContent.match(/\d+/g).map(Number);
        var target_date = new Date(current_date[0],current_date[1]-1)
        return target_date;
    }

    before(){
        var target_date = this.unified_month_process();
        target_date.setMonth(target_date.getMonth()-1);
    
        month.textContent = `${target_date.getFullYear()}年${target_date.getMonth()+1}月`;
        this.setRowLabels();
        this.key_year = target_date.getFullYear();
        this.key_month = target_date.getMonth()+1;
        if(this.user_index!="admin"){
            this.current_data = this.MatuallySuitableDate_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`];
        }else{
            this.current_data = this.data_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`];
        }

        if(Array.isArray(this.current_data)){
            ////console.log("THERE");
            this.data_set_initialize();
            this.set_data();
        }else{
            ////console.log("NO DATA")
            if(this.user_index != "admin"){
                this.data_set_initialize(1);
            }else{
                this.data_set_initialize();
            }
            this.data_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`] = this.data_set;
            this.current_data = this.data_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`];
            this.set_data();
        }

        ////console.table(this.current_data);

    }

    next(){
        var target_date = this.unified_month_process();
        target_date.setMonth(target_date.getMonth()+1);

        month.textContent = `${target_date.getFullYear()}年${target_date.getMonth()+1}月`;
        this.setRowLabels();
        this.key_year = target_date.getFullYear();
        this.key_month = target_date.getMonth()+1;
        if(this.user_index!="admin"){
            this.current_data = this.MatuallySuitableDate_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`];
        }else{
            this.current_data = this.data_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`];
        }
        if(Array.isArray(this.current_data)){
            // //console.log("THERE");
            this.data_set_initialize();
            this.set_data();
        }else{
            ////console.log("NO DATA")
            if(this.user_index != "admin"){
                this.data_set_initialize(1);
            }else{
                this.data_set_initialize();
            }
            this.data_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`] = this.data_set;
            this.current_data = this.data_dict[`${target_date.getFullYear()}年${target_date.getMonth()+1}月`];
            this.set_data();
        }

        ////console.table(this.current_data);
    }

    set_data(){


        var target_cell = "";
        var c_list = ["morning","day","night"]
        var value = "";
        var index = 0;
        for(let r = 1; r <= 32;r++){
            for(let c = 0; c <= 2; c++){
                /////console.log(`row${r}_${c_list[c]}`);
                target_cell = document.getElementById(`row${r}_${c_list[c]}`);
                ////console.log(this.current_data[r-1][c][0]);
                value = this.current_data[r-1][c][0];
                
                if(value == "Nan"){
                    value = "";
                }
                target_cell.textContent = value;

                index = this.current_data[r-1][c][1];
                if(index){
                    if(this.user_index=="ref" && target_cell.textContent=="〇"){
                        target_cell.style.color = this.suitable_day_color;
                    }else{
                        if(window.getComputedStyle(target_cell).color != this.invalid_cell_color && this.user_index != "admin"){
                            target_cell.style.color = this.invalid_cell_color;                       
                        }
                    }    
                }else{
                    if(window.getComputedStyle(target_cell).color == this.invalid_cell_color){
                        //console.log(`${target_cell.id}'s color is changed to VALID color`)
                        target_cell.style.color = "rgb(0,0,0)";
                    }
                }
            }
        }

       
    }

    send_data(){
        var dbRef_data =  ref(this.db, `data/${this.user_index}/${this.data[1]}`);
        if(this.user_index=="admin"){
            var JSON_data = JSON.stringify(this.data_dict);
        }else{
            var JSON_data = JSON.stringify(this.MatuallySuitableDate_dict);
        }
        set(dbRef_data,JSON_data);

       
        if(this.user_index=="admin"){
            alert("送信が完了しました。\n日程照合画面へ遷移します。")
            this.target = "日程照合";
            this.link()
        }else{
            alert("入力ありがとうございました。\ngoogle.comへ遷移します。");
            window.location.href = "https://google.com";
        }

    
    }
}


const system = new SiteSyste();


'use strict';

var vcpapp = angular.module('vcpmodule', ['ui.bootstrap', 'firebase']);

var page = {
    c:{}
}
vcpapp.controller(page.c);


vcpapp.directive('enterKeypress', function(){
        return function(scope, element, attrs) {
            element.bind("keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.enterKeypress);
                    });
                    event.preventDefault();
                }
            });
        };
    });

vcpapp.directive( 'addFooter', function () {
    return {
        scope: false,
        restrict:'EA',
        template: '<a ng-hide="csstitleform" ng-class="{displaynone: footer.length > 4}" href="#" class="sub_addlink" ng-click="showAddFooterForm()">+</a>'+
                '<form name="form" ng-show="csstitleform" action="" method="get" class="newlink_panel">'+
                '<h1 class="PopupTitle"><a href="#" class="TipBoxClose" ng-click="hideAddFooterForm();"></a>Link Data</h1>'+
                '<div class="newlink_panel_name">'+
                '<input type="text" class="input_newlink" maxlength="10" required ng-model="menuname" placeholder="Nav link name">'+
                '</div><div class="newlink_panel_form"><label class="radio clearfix">'+
                '<input type="radio" ng-model="menutype" value="other">'+
                '<input type="url" ng-model="linkedurl" class="input_url" placeholder="URL">'+
                '</label><label class="radio clearfix">'+
                '<input type="radio" ng-model="menutype" value="local">'+
                '<select style="width:110px;" ng-model="localurl" ng-options="page.pagename as page.pagename for page in pages">'+
                '</select></label><div class="newlink_panel_btn">'+
                '<span ng-show="showerror" style="color:red;font-size:12px;">Please delete it is all child menu.</span><br>'+
                '<input type="submit" value="save" class="btn btn-save" ng-click="saveAddFooterForm(form)">'+
                '</div></div></form>',
        link: function ( scope, element, attrs ) {

            //显示添加footer form
            scope.showAddFooterForm = function(){
                //初始化默认值
                scope.localurl="Homepage";
                scope.menutype = "local";
                scope.linkedurl = "";
                scope.menuname = "";

                scope.csstitleform = true;
            }

            //隐藏添加footer form
            scope.hideAddFooterForm = function(){
                scope.csstitleform = false;
            }

            //保存footer nav
            scope.saveAddFooterForm = function(back){
                if (back.$valid) {
                    if(scope.footer.length==0){
                        var footeridindex=1;
                    }else{
                        var footeridindex=scope.footer[scope.footer.length-1].footerid+1;
                    }
                   // debugger;
                    if(scope.menutype=="other"){
                        scope.linkedpageid=0;
                    }else{
                        scope.linkedpageid=scope.checkpargeid(scope.localurl);
                        scope.linkedurl = scope.localurl;
                    }
                    var newfooterdata={
                        footerid:footeridindex,
                        footername:scope.menuname,
                        footertype:scope.menutype,
                        linkedurl:scope.linkedurl,
                        linkedpageid:scope.linkedpageid,
                        linkedpagename:scope.linkedpagename
                    };
                    if(typeof(scope.sitedataFirebase.footerdata) == "undefined"){
                        scope.sitedataFirebase.footerdata=[];
                    }
                    scope.sitedataFirebase.footerdata.push(newfooterdata);
                    scope.footer = scope.sitedataFirebase.footerdata;
                    scope.csstitleform = false;
                }
            }
        }
    };
});


/* Controllers */
page.c.pageListcontroller = function($scope, $location, $http, $q, modelSite, angularFire) {

    var urlmaxid = "https://vcplatform.firebaseIO.com/maxid";
    $scope.maxidFirebase = angularFire(urlmaxid, $scope, 'maxidFirebase', {});

    var urlartilcelist = "https://vcplatform.firebaseIO.com/articles";
    $scope.articlesFirebase = angularFire(urlartilcelist, $scope, 'articlesFirebase', [] );

    var urltaglist = "https://vcplatform.firebaseIO.com/tags";
    $scope.tagsFirebase = angularFire(urltaglist, $scope, 'tagsFirebase', [] );

    var urlsitedata = "https://vcplatform.firebaseIO.com/sitedata";
    $scope.sitedataFirebase = angularFire(urlsitedata, $scope, 'sitedataFirebase', {} );

    var urlpages = "https://vcplatform.firebaseIO.com/pages";
    $scope.pages = angularFire(urlpages, $scope, 'pages', [] );


    function getMaxBlockId(){
        if($scope.maxidFirebase.blockid == undefined ){
            $scope.maxidFirebase.blockid = 101;
        }else{
            $scope.maxidFirebase.blockid = $scope.maxidFirebase.blockid  + 1;
        }
        return $scope.maxidFirebase.blockid
    }

    function getMaxPageId(){
        if($scope.maxidFirebase.pageid == undefined ){
            $scope.maxidFirebase.pageid = 101;
        }else{
            $scope.maxidFirebase.pageid = $scope.maxidFirebase.pageid  + 1;
        }
        return $scope.maxidFirebase.pageid
    }

    function getMaxTagId(){
        if($scope.maxidFirebase.tagid == undefined ){
            $scope.maxidFirebase.tagid = 100001;
        }else{
            $scope.maxidFirebase.tagid = $scope.maxidFirebase.tagid  + 1;
        }
        return $scope.maxidFirebase.tagid
    }

    function checkTagExist(tagname) {
        var tagresult = _.findWhere($scope.tagsFirebase, {tagname: tagname});

        if (tagresult === undefined) {
            return false;
        }else{
            return tagresult;
        }
    }


    function fireBaseGetArticlesByTags (taglistdata, blockcategory, quantity) {
        var articlesresultunion = [];
        var articlesresultfinal = [];

        var articlesresulttag = [];
        var articlesresultcategory = [];

        var articlelist = $scope.articlesFirebase;

        if(blockcategory !== 'All'){
            articlesresultcategory = _.filter(articlelist, function(aritcle){
                if (aritcle.category == blockcategory){
                    return true
                }
            });
        }else{
            articlesresultcategory = articlelist;
        }
        console.dir(articlesresultcategory);
        articlesresulttag = _.filter(articlesresultcategory, function(aritcle){
            var singlearticletags = _.filter(aritcle.tags, function(singletag){
                var tagresult = _.where(taglistdata, {tagname: singletag.tagname});
                return tagresult.length;
            });
            return  singlearticletags.length;
        });



//        articlesresultunion = _.union(articlesresulttag, articlesresultcategory);
        articlesresultfinal = _.where(articlesresulttag, {status: "Published"});

        if(articlesresultfinal.length > quantity){
            articlesresultfinal.splice(0, articlesresultfinal.length - quantity);    //判断文章数量
        }


        articlesresultfinal = _.sortBy(articlesresultfinal, function(article){ return -article.updated });

        return articlesresultfinal;
    }

    $scope.cssaddfooterform = false;

    $('#tagsinput').tagsInput();

    $scope.newblock = {
        blockid : 100,
        blocktype : 'auto',
        blockstatictype : '',
        blocktitle : "title1",
        blockname : "",
        blocklayout : 10,
        blockquantity : 6,
        blocktag : [],
        blockcategory : 'All',
        blocksortby : 'bydate',
        apiurl : "",
        adsname : "",
        adscode : ""
    };
    $scope.newarticle = undefined;

//    var site = modelSite.getSite();
    var site = {};
	
	// The default page is entered, the display animation
	$scope.cssloading = true; //Block Loading GIF
	$scope.csspagelayout = false; //Loading start: hide PageLayout 
	$scope.csspagelist = false; //Loading end: show PageList
	
    $q.all([$scope.sitedataFirebase, $scope.articlesFirebase, $scope.pages]).then(function() {
        site = $scope.sitedataFirebase ;
        $scope.get_site = site;

        $scope.pagearticletype = site.defaultsettings.articleTypeId;    // left menu default selected page
        $scope.pagefilterarticle = site.defaultsettings.pagefilterArticleType;  //Article Type Page
        $scope.pagefilterlist = site.defaultsettings.pagefilterListType;         //List Type Page
        $scope.layoutfilterlisttype = site.defaultsettings.layoutfilterListType;
        $scope.defaultselectedpageindex = site.defaultsettings.defaulstSelectedPageIndex;    // left menu default selected page
        $scope.defaultselectedlayoutindex = site.defaultsettings.defaulstSelectedLayoutIndex;    // right menu default selected page


        //获取选中的header theme
        $scope.get_headertheme = site.defaultsettings.headerthemeindex;

        if($scope.get_headertheme == -1){
            $scope.cssheaderthemeindex = -1;
            $scope.cssheadermenuhavadata = false;
        }else{
            $scope.cssheaderthemeindex = $scope.get_headertheme;
            $scope.cssheadermenuhavadata = true;
        }

        //获取选中的footer theme
        $scope.get_footertheme = site.defaultsettings.footerthemeindex;

        if($scope.get_footertheme == -1){
            $scope.cssfooterthemeindex = -1;
            $scope.cssfootermenuhavadata = false;
        }else{
            $scope.cssfooterthemeindex = $scope.get_footertheme;
            $scope.cssfootermenuhavadata = true;
        }

        $scope.header = site.headerdata;
        $scope.headerthemes = site.headertheme;

        $scope.footer = site.footerdata;
        $scope.footerthemes = site.footertheme;

        if(typeof(site.headerdata) == "undefined"){
            $scope.header = [];
        }

        if(typeof(site.footerdata) == "undefined"){
            $scope.footer = [];
        }




        $scope.singlepage =  $scope.pages[0];   //默认读取首页

        //载入所有block的文章
        for (var i= $scope.pages.length-1; i>=0; i--)
        {
            for (var j = $scope.pages[i].pagelayoutdata.length-1; j>=0; j--)
            {
                if(typeof($scope.pages[i].pagelayoutdata[j].blocks) == "undefined"  ){
                }
                else{
                    for (var k = $scope.pages[i].pagelayoutdata[j].blocks.length-1; k>=0; k--)
                    {
                        if($scope.pages[i].pagelayoutdata[j].blocks[k].blocktype == 'auto'){
                            var articlesdata = fireBaseGetArticlesByTags($scope.pages[i].pagelayoutdata[j].blocks[k].blocktag,  $scope.pages[i].pagelayoutdata[j].blocks[k].blockcategory, $scope.pages[i].pagelayoutdata[j].blocks[k].blockquantity);
                            $scope.pages[i].pagelayoutdata[j].blocks[k].blockarticles = articlesdata;

//                            console.log(articlesdata, $scope.pages[i].pagelayoutdata[j].blocks[k].blocktag, $scope.pages[i].pagelayoutdata[j].blocks[k].blockquantity );

                        }
                    }
                }
            }
        }

        $scope.localarticles = $scope.articlesFirebase;    // Use FireBase
		 
		 $scope.cssloading = false;  //Block Loading GIF
		 $scope.csspagelayout = true; //Loading end: show PageLayout
		 $scope.csspagelist = true; //Loading end: show PageList

    });



	
    $scope.cssheadermenubutton = false;
    $scope.cssfootermenubutton=false;

    $scope.newpage ={};
//        $scope.localarticles = modelArticle.getArticleList(100);


    $scope.layouts = modelSite.getLayoutList();
    $scope.blocklayouts = modelSite.getBlockLayout();
    $scope.currentlayoutcontainer = {};


    $scope.selectedpageattributeindex = -1;    //默认隐藏所有page的属性面板
    $scope.selectedpageblockindex = -1;



    $scope.cssshowpageaddinput = false;    //添加page的输入框默认不显示

    $scope.cssblocktipadd = false;      //点击当前添加block按钮显示对应block类型菜单
    $scope.cssblocktipedit = false;      //点击当前编辑block按钮显示对应block类型菜单

    $scope.cssblockeditmenuinputbox = false;   //点击当前编辑block的 要输入推荐文章的输入框
    $scope.cssblockeditmenubutton = false;     //点击当前编辑block的 设置的按钮

    $scope.cssheadersetting = false;      //Header设置nav下拉界面
    $scope.cssheadernavindex = 0;      //Header默认菜单的颜色为首页

    $scope.cssfootersetting = false;




    //left side bar
    $scope.isarticle = '';
    $scope.clickpage = function(indexid, page, layout) {

        $(".container").prepend($(".tip_box")); //移动 Tip Box DOM , 防止因为刷新页面而丢失DOM
        $scope.defaultselectedpageindex = indexid;
        $scope.singlepage = page;

        if(page.pagetype === $scope.pagearticletype) {
            $scope.layoutfilterlisttype = {layouttype:1 };
        }else{
            $scope.layoutfilterlisttype = {layouttype:0 };
        }
        $scope.cssshowpageaddinput = false;       //添加page的输入框不显示
        if(page.pagetype == 11){
            $scope.isarticle = 'span9';

        }else{
            $scope.isarticle = '';
        }
    };

    $scope.showeditpageattribute = function() {
        $scope.csspageattribute = true;       //添加page的输入框显示
    };
    $scope.closeeditpageattribute = function() {
        $scope.csspageattribute = false;       //添加page的输入框显示
    };


    //left side bar add page
    $scope.showaddpageinput = function() {
        $scope.newpage.pagename = '';
        $scope.cssshowpageaddinput = true;       //添加page的输入框显示
    };

    $scope.addpage = function() {
        $(".container").prepend($(".tip_box"));  //移动 Tip Box DOM , 防止因为刷新页面而丢失DOM
        $scope.cssblocktipbox = false;

        $scope.cssshowpageaddinput = false;       //添加page的输入框显示
        var newpage = {
            siteid : 1,
            pagename : $scope.newpage.pagename,
            pageid : getMaxPageId(),
            pagetype : 100,
            pagetitle : $scope.newpage.pagetitle,
            pageurl : $scope.newpage.pageurl,
            pageorder : 100,
            pagelayoutid : 10,
            pagelayoutdata:[
                {layoutcontainerclass:"span9", layoutcontainerid:1000 , blocks:[] },
                {layoutcontainerclass:"span3", layoutcontainerid:1001, blocks:[] }
            ]
        };
        $scope.pages.push(newpage);
    };


    //left side bar add page attribute
    $scope.showeditpageattribute = function(indexid) {
        $scope.selectedpageattributeindex = indexid;    //点击显示当前的page 属性面板
    };

    $scope.closeeditpageattribute = function(indexid) {
        $scope.selectedpageattributeindex = -1;    //关闭当前的page 属性面板
    };

    $scope.editsavepage = function(page) {
        $scope.selectedpageattributeindex = -1;    //关闭当前的page 属性面板

    };
    $scope.delpage = function( page) {
        $scope.selectedpageattributeindex = -1;    //关闭当前的page 属性面板
        if(page.pagetype >= 20){
            //首页和内容页面都是无法删除的
            var pageindex = $scope.pages.indexOf(page);
            $scope.pages.splice(pageindex, 1);
        }
    };

    //right side bar
    $scope.clicklayout = function(indexid, layout) {
        $(".container").prepend($(".tip_box")); //移动 Tip Box DOM , 防止因为刷新页面而丢失DOM
        $scope.cssblocktipbox = false;
        $scope.defaultselectedlayoutindex = indexid;

        _.each($scope.pages, function(page){
            if(page.pageid == $scope.singlepage.pageid){
                page.pagelayoutdata = angular.copy(layout.layoutdata);
                $scope.singlepage = page;
            }
        });
    };




    // show Block MouseOver Menu Button
    $scope.showeditblockmenubutton= function(layout) {
        $scope.currentlayoutcontainer = layout;  //移动菜单要赋值当前是哪个layout
        this.cssblockeditmenubutton = true;
    };
    $scope.hideeditblockmenubutton = function() {
        this.cssblockeditmenubutton = false;
        this.cssblockeditmenuinputbox = false;
    };

    $scope.showarticleinput = function(){
        this.cssblockeditmenuinputbox = true;
    };
    $scope.showblocksetting = function(){
        this.cssblockeditmenubutton = false;
    };
    $scope.moveblock = function(){
        this.cssblockeditmenubutton = false;
    };
    $scope.delblock = function(){
        this.cssblockeditmenubutton = false;
    };

    //show add New Blocks Menu BOX
    $scope.showcontenticon = false;//是否显示centent icon
    $scope.showaddblockmenubutton = function() {
        this.cssblockaddmenubutton = true;
        if(this.showautoblockstyle || this.showeditorblockstyle || this.showrssblockstyle){
            this.showcontenticon = false;
        }else{
            this.showcontenticon = true;
        }
    };


    $scope.hideaddblockmenubutton = function() {
        if(this.showautoblockstyle || this.showeditorblockstyle || this.showrssblockstyle){
            this.cssblockaddmenubutton = true;
        }else{
            this.cssblockaddmenubutton = false;
        }
        if(this.showstaticblockstyle || this.showadblockstyle){
            this.cssblockaddmenubutton = true;
            this.showcontenticon = true;
        }else{
            this.showcontenticon = false;
        }
        this.cssblocktipadd = ''; //移除block图标选中的样式
    };

    //关闭Auto block弹出框
    $scope.closeautoblock = function() {
        copythis.showautoblockstyle = false;
        $scope.cssblocktipbox = '';
    }
    //关闭editor block
    $scope.closeeditorblock = function(){
        copythis.showeditorblockstyle = false;
        $scope.cssblocktipbox = '';
    }
    //关闭rss block
    $scope.closerssblock = function(){
        copythis.showrssblockstyle = false;
        $scope.cssblocktipbox = '';
    }
    //关闭static block
    $scope.closestaticblock = function(){
        copythis.showstaticblockstyle = false;
        $scope.cssblocktipbox = '';
    }
    //关闭ad block
    $scope.closeadblock = function(){
        copythis.showadblockstyle = false;
        $scope.cssblocktipbox = '';
    }

    $scope.showautoblockstyle = false;
    $scope.showeditorblockstyle = false;
    $scope.showrssblockstyle = false;
    $scope.showstaticblockstyle = false;
    $scope.showadblockstyle = false;
    var copythis = '';
    $scope.showblocksettingmenu = function( blocktype, event1, layoutcontainer ) {
        $scope.selectblockicon = 0;
        $scope.autoblocklayout = 100;
        $scope.selecteditorblockicon = 0;
        $scope.autoeditorblocklayout = 100;
        $scope.selectrssblockicon = 1;
        $scope.rsseditorblocklayout = 101;
        $scope.newblock.blockname = '';
        if(copythis !== ''){
             copythis.showautoblockstyle = false;
             copythis.showeditorblockstyle = false;
             copythis.showrssblockstyle = false;
             copythis.showstaticblockstyle = false;
             copythis.showadblockstyle = false;
             copythis.cssblockaddmenubutton = false;
             copythis.showcontenticon = false;
        }
        this.cssblocktipadd = false;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipbox = false;
        copythis = this;

        $scope.currentlayoutcontainer = layoutcontainer;
        this.showautoblockstyle = false;
        this.showeditorblockstyle = false;
        this.showrssblockstyle = false;
        switch(blocktype)
        {
            case 'auto':
                this.cssblocktipadd = blocktype;      //点击当前block按钮显示对应block类型菜单
                $scope.cssblocktipbox = blocktype;
                this.showautoblockstyle = true;
                this.cssblockaddmenubutton = true;
                this.showcontenticon = false;
                break;
            case 'editor':
                this.cssblocktipadd = blocktype;      //点击当前block按钮显示对应block类型菜单
                $scope.cssblocktipbox = blocktype;
                this.showeditorblockstyle = true;
                this.cssblockaddmenubutton = true;
                this.showcontenticon = false;
                break;
            case 'static':
                this.cssblocktipadd = blocktype;      //点击当前block按钮显示对应block类型菜单
                $scope.cssblocktipbox = blocktype;
                this.cssblockaddmenubutton = true;
                this.showcontenticon = true;
                this.showstaticblockstyle = true;
                break;
            case 'ads':
                this.cssblocktipadd = blocktype;      //点击当前block按钮显示对应block类型菜单
                $scope.cssblocktipbox = blocktype;
                this.cssblockaddmenubutton = true;
                this.showcontenticon = true;
                this.showadblockstyle = true;
                break;
			case 'RSS':
                this.cssblocktipadd = blocktype;      //点击当前block按钮显示对应block类型菜单
                $scope.cssblocktipbox = blocktype;
                this.showrssblockstyle = true;
                this.cssblockaddmenubutton = true;
                this.showcontenticon = false;
                break;
            default:
        }


        var blockcontent = $(event1.target).parent().parent();     //获取id 为 blockcontent DIV .
        blockcontent.append($(".tip_box"));
        var blocktypemenu = $(".tip_"+ blocktype);     //获取样式名称拼接 .
        var left =  ( parseInt(blockcontent.width() ) - parseInt( blocktypemenu.width() ) )/2;
        blocktypemenu.css({"left":left+"px", "top":-(blocktypemenu.height()), "position":"absolute"});
    };

    $scope.clickblocklayouttab = function(event1, divid) {
        var heightdiff;
        switch(divid)
        {
            case 'tab-layout':
                heightdiff = 274;
                break;
            case 'tab-filter':
                heightdiff = 249;
                break;
            case 'tab-Sort':
                heightdiff = 101;
                break;
            default:
        }
        var blockcontent2 = $(event1.target).parent().parent().parent().parent().parent();    //获取id 为 blockcontent DIV .
        var blocktypemenu2 = $(".tip_auto");     //获取样式名称拼接
//        var heightdiff = 81 + $("#"+ divid ).height();
        blocktypemenu2.css({"top":-(heightdiff), "position":"absolute"});
//        console.log(blockcontent2.height(), blocktypemenu2.height(), heightdiff);
    };
    //默认选中layout icon
    $scope.selectblockicon = 0;
    $scope.autoblocklayout = 100;
    //选中layout图标事件
    $scope.selectlayout = function(index,blocklayout){
        $scope.selectblockicon = index;
        $scope.autoblocklayout = blocklayout;
    }


    $scope.selecteditorblockicon = 0;  //设定editor选中图标
    $scope.autoeditorblocklayout = 100;    //设定editor layout id

    //选中Editor layout图标事件
    $scope.selecteditorlayout = function(index,blocklayout){
        $scope.selecteditorblockicon = index;
        $scope.autoeditorblocklayout = blocklayout;
    }

    $scope.selectrssblockicon = 1;    //设定rss选中图标
    $scope.rsseditorblocklayout = 101; //设定rss layout id

    //选中RSS layout 图标事件
    $scope.selectrsslayout = function(index,blocklayout){
        $scope.selectrssblockicon = index;
        $scope.rsseditorblocklayout = blocklayout;
    }

    // add a block to page
    $scope.addblocktopage = function(blocktype, layoutcontainer, indexid, blocklayoutid ) {
        var newblock = {
            blockid : getMaxBlockId(),
            blocktype : 'auto',
            blockstatictype : '',
            blockname : "",
            blocklayout : blocklayoutid,
            blockquantity : 0,
            blocktag : [],
            blockcategory : 'All',
            blocksortby : 'date',
            blockarticles : [],
            apiurl : "",
            adsname : "",
            adscode : ""
        };
        switch(blocktype)
        {
            case 'auto':
                newblock.blocktype = 'auto';
                newblock.blockname = $scope.newblock.blockname;
                newblock.blockquantity = Number($scope.newblock.blockquantity);
                newblock.blockcategory = $scope.newblock.blockcategory;

                //检查Tags
                var temptagslistname = $(".tagsinput").exportTags();

                for(var i=0;i<temptagslistname.length;i++){
                    //在tag 数据库查询是否是已经存在的tag
                    var newtag;
                    if( checkTagExist(temptagslistname[i]) ){
                        newtag = checkTagExist(temptagslistname[i]);
                    }else{
                        newtag = {
                            "tagid" : getMaxTagId(),
                            "tagname" : temptagslistname[i]
                        };
                        $scope.tagsFirebase.push(newtag);
                    }
                    newblock.blocktag.push(newtag);
                }

                //通过Tags 获取文章
//                newblock.blockarticles = modelArticle.getArticlesByTags(newblock.blocktag, newblock.blockquantity, newblock.blockcategory);
                newblock.blockarticles = fireBaseGetArticlesByTags(newblock.blocktag, newblock.blockcategory, newblock.blockquantity );     // Use FireBase

                this.showautoblockstyle = false;
                $scope.cssblocktipbox = '';
/*                if (temptagslistname.length == 0 || newblock.blockquantity == ''){
                    newblock.blockarticles = modelArticle.getArticles(newblock.blockquantity);
                }*/

                break;

            case 'editor':
                newblock.blocktype = 'editor';
                newblock.blockname = $scope.newblock.blockname;
                newblock.blockquantity = Number($scope.newblock.blockquantity);
                this.showeditorblockstyle = false;
                $scope.cssblocktipbox = '';
                break;

            case 'statictext':
                newblock.blocktype = 'static';
                newblock.blockstatictype = 'text';
                break;

            case 'staticpic':
                newblock.blocktype = 'static';
                newblock.blockstatictype = 'pic';
                break;

            case 'staticvideo':
                newblock.blocktype = 'static';
                newblock.blockstatictype = 'video';
                break;

            case 'staticslideshow':
                newblock.blocktype = 'static';
                newblock.blockstatictype = 'slideshow';
                break;


            case 'ads':
                newblock.blocktype = 'ads';
                newblock.adsname = $scope.newblock.adsname;
                newblock.adscode = $scope.newblock.adscode;
                break;

            case 'RSS':
                newblock.blocktype = 'RSS';
                newblock.blockname = $scope.newblock.blockname;
                newblock.urlapi = $scope.newblock.urlapi;
                this.showrssblockstyle = false;
                $scope.cssblocktipbox = '';
                break;

            default:
        }
        $(".container").prepend($(".tip_box")); //移动 Tip Box DOM , 防止因为刷新页面而丢失DOM
            _.each($scope.pages, function(page){
                if(page.pageid == $scope.singlepage.pageid){
                    _.each(page.pagelayoutdata, function(layout){
                        if(layout.layoutcontainerid == layoutcontainer.layoutcontainerid){

                            if(typeof(layout.blocks) == "undefined"  ){
                                layout.blocks = [];
                                layout.blocks.push(newblock);
                            }else{
                                layout.blocks.push(newblock);
                            }
//                            console.log(layout.blocks.length);
                        }
                    });
                    $scope.singlepage = page;
                }
            });




//        addSingleBlockToPage(newblock, layoutcontainer, $scope.singlepage );
        this.cssblocktipadd = false;          //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipbox = false;
    };

    $scope.addAritcleToEditorBlock = function(editorblock, layoutcontainer ){
        if(typeof(editorblock.blockarticles) == "undefined"  ){
            editorblock.blockarticles = [];
        }

        if(editorblock.blockarticles.length < editorblock.blockquantity){
            var newaritcle = this.newarticle;
//            modelSite.addArticleToBlock(newaritcle, block, layoutcontainer, $scope.singlepage);
            _.each($scope.pages, function(page){
                if(page.pageid == $scope.singlepage.pageid){

                    _.each(page.pagelayoutdata, function(layout){

                        if(layout.layoutcontainerid == layoutcontainer.layoutcontainerid){
                            _.each(layout.blocks, function(block){
                                if(block.blockid == editorblock.blockid){

                                    if(typeof(block.blockarticles) == "undefined"  ){
                                        block.blockarticles = [];

                                    }
                                    var alreadyhavethisarticle = [];
                                    alreadyhavethisarticle = _.where(block.blockarticles, {id: newaritcle.id});
                                    if(alreadyhavethisarticle.length == 0){
                                        block.blockarticles.push(angular.copy(newaritcle));
                                    }


                                }
                            });
                        }
                    });
                    $scope.singlepage = page;

                }
            })
        }
    };

    // del a block to page
    $scope.delblock = function(delblock, layoutcontainer, indexid ) {
        _.each($scope.pages, function(page){
            if(page.pageid == $scope.singlepage.pageid){
                _.each(page.pagelayoutdata, function(layout){
                    if(layout.layoutcontainerid == layoutcontainer.layoutcontainerid){
                        var newblock = _.findWhere(layout.blocks, {blockid : delblock.blockid});
                        var blockindex = layout.blocks.indexOf(newblock);
                        layout.blocks.splice(blockindex, 1);
//                        console.log(layout.blocks.length);
                    }
                });
                $scope.singlepage = page;
            }
        });


//        modelSite.delBlockFromPage(block, layoutcontainer, $scope.singlepage);
    };

    // update a block setting
    $scope.updateshowblcoksetting = function(block, event1 ) {
        $scope.newblock.blockname = block.blockname;
        var blocktype =  block.blocktype;
        switch(blocktype)
        {
            case 'auto':
                $scope.cssblocktipbox = blocktype;
                break;
            case 'editor':
                $scope.cssblocktipbox = blocktype;
                break;
            case 'static':
                $scope.cssblocktipbox = blocktype;
                break;
            case 'ads':
                $scope.cssblocktipbox = blocktype;
                break;
            default:
        }

        var blockcontent = $(event1.target).parent().parent();     //获取id 为 blockcontent DIV .
        blockcontent.append($(".tip_box"));
        console.log($(".tip_box"));
        var blocktypemenu = $(".tip_"+ blocktype);     //获取样式名称拼接 .
        var left =  ( parseInt(blockcontent.width() ) - parseInt( blocktypemenu.width() ) )/2;
        blocktypemenu.css({"left":left+"px", "top":-(blocktypemenu.height()), "position":"absolute"});
    }

    $scope.check = function( ) {
        console.log(this.blockarticles);
    };




    //header
    var headerflag=false;
    var headerparentid='';
    var parentmenuindex='';
    var childmenudata='';
    var childmenuindex='';
    var classidhtml='';
    $scope.showli=-1;
    $scope.showa=-1;
    $scope.showchilda=-1;
    $scope.showerror=false;
    $scope.headerlocalurl='';

    //show header menu and theme
    $scope.showheadermenusetting = function(){
        //$scope.cssheadermenuhavadata = false;      //Header是否有数据
//       $scope.cssheadersetting = false;          //Header设置面板是否显示
        $scope.cssheadermenubutton = true;      //Header右上角mouseover按钮     //所有Header Block经过时显示Attribute Panel Icon
    };

    $scope.hideheadermenusetting = function(){
        $scope.cssheadermenubutton = false;      //Header右上角mouseover按钮
        $scope.cssheadersetting = false;          //Header设置面板是否显示
    };

    $scope.clickheadertheme = function(indexid, themedata){
        //点击Nav 的每个Theme
        $scope.cssheaderthemeindex = indexid;      //Header选中的theme
        $scope.cssheadermenuhavadata = true;      //Header是否有数据已有数据了

        $scope.sitedataFirebase.defaultsettings.headerthemeindex = indexid;
//        modelSite.setheadertheme(indexid);
    };

    $scope.slideshowheadersetting = function(){
        //点击Nav Block的设置图标
        $scope.cssheadersetting = true;
    };

    //insert header data form
    var insertdata=false;   //是否新增还是修改
    var ishead=false;   //是否是头部还是底部
    $scope.footerli=-1;  // 选中footer菜单索引值
    $scope.cssshowdeleteicon = false;//显示delete 按钮
    $scope.showheaderform=function(index,ischild,evt,isheader){
        var blockcontent = $(evt.target).parent().parent();
        blockcontent.append($(".newlink_panel"));
        $scope.csstitleform=true;
        ishead=isheader;
        $scope.footercommonfunction();
        if(isheader){
            $scope.showli=$scope.csstitleform ? index : -1;//  选中header菜单索引值
            $scope.showerror=false;  //显示删除出错的信息
            headerflag=ischild;     //是否header还是child
            headerparentid=index; //header parentid
        }else{
            $scope.footerli=$scope.csstitleform ? index : -1;
        }
        $scope.newheaderdata.menutype='local';
        $scope.newheaderdata.menuname="";
        $scope.newheaderdata.linkedurl="";
        $scope.headerlocalurl="Homepage";
        $("#urltype1").attr("checked",false);
        $("#urltype2").attr("checked",true);
        setupLabel();
        insertdata=true;

        $scope.cssshowdeleteicon = false;

    };
    $scope.newheaderdata ={};

    //查找page id
    $scope.checkpargeid=function(url){
        for(var i=0;i<$scope.pages.length;i++){
            if($scope.pages[i].pagename== url){
                return $scope.pages[i].pageid;
            }
        }
    };
    //save data
    $scope.saveheaderinfo=function(){
        if($scope.newheaderdata.menuname == ""){
            return;
        }
        if($scope.newheaderdata.menutype=="other"){
            $scope.newheaderdata.menutype='other';
            if($scope.newheaderdata.linkedurl==""){
                return;
            }
            $scope.newheaderdata.linkedurl=$scope.newheaderdata.linkedurl;
            $scope.newheaderdata.linkedpagename=$scope.newheaderdata.linkedurl;
            $scope.newheaderdata.linkedpageid=0;
        }else{
            $scope.newheaderdata.menutype='local';
            $scope.newheaderdata.linkedurl=$scope.headerlocalurl;
            $scope.newheaderdata.linkedpagename= $scope.headerlocalurl;
            $scope.newheaderdata.linkedpageid=$scope.checkpargeid();
        }
        $scope.csstitleform=false;
        $scope.footercommonfunction();

        if(ishead){  //当前保存是否是header还是footer
            if(headerflag){ //是否header还是child
                if(insertdata){    //是否是添加还是修改
                    $scope.addheaderparentnav();
                }else{
                    $scope.editheaderparentnav();
                }
            }else{ //child 添加和修改方法
                if(insertdata){
                    $scope.addheaderchildnav();
                }else{
                    $scope.editheaderchildnav();
                }
            }
        }else{  //footer修改和添加方法
            if(insertdata){
                $scope.addfooternav();
            }else{
                $scope.editfooternav();
            }
        }
        $scope.header = $scope.sitedataFirebase.headerdata;
        $scope.footer = $scope.sitedataFirebase.footerdata;
    };

    //子菜单修改
    $scope.editheaderchildnav = function(){
        headchildclass.menuname=$scope.newheaderdata.menuname;
        headchildclass.menutype=$scope.newheaderdata.menutype;
        headchildclass.linkedurl=$scope.newheaderdata.linkedurl;
        headchildclass.linkedpageid=$scope.newheaderdata.linkedpageid;
        headchildclass.linkedpagename=$scope.newheaderdata.linkedpagename;

        $scope.sitedataFirebase.headerdata = $scope.get_site.headerdata;
//                    modelSite.savesitedata($scope.get_site);
    }

    //子菜单添加
    $scope.addheaderchildnav = function(){
        if(typeof($scope.sitedataFirebase.headerdata) == "undefined"){
            $scope.sitedataFirebase.headerdata = [];
        }
        if(typeof($scope.sitedataFirebase.headerdata[headerparentid].childdata) == "undefined"){
            $scope.sitedataFirebase.headerdata[headerparentid].childdata=[];
        }

        if($scope.header[headerparentid].childdata.length==0){
            var childidindex=1;
        }else{
            var childidindex=$scope.header[headerparentid].childdata[$scope.header[headerparentid].childdata.length-1].childid+1;
        }
        var newheaderdata={
            childid:childidindex,
            menuname:$scope.newheaderdata.menuname,
            menutype:$scope.newheaderdata.menutype,
            linkedurl:$scope.newheaderdata.linkedurl,
            linkedpageid:$scope.newheaderdata.linkedpageid,
            linkedpagename:$scope.newheaderdata.linkedpagename
        };


        $scope.sitedataFirebase.headerdata[headerparentid].childdata.push(newheaderdata);

//                    modelSite.addHeaderChildMenu(headerparentid,newheaderdata);
    }

    //一级菜单修改
    $scope.editheaderparentnav = function(){
        headclass.menuname=$scope.newheaderdata.menuname;
        headclass.menutype=$scope.newheaderdata.menutype;
        headclass.linkedurl=$scope.newheaderdata.linkedurl;
        headclass.linkedpageid=$scope.newheaderdata.linkedpageid;
        headclass.linkedpagename=$scope.newheaderdata.linkedpagename;

        $scope.sitedataFirebase.headerdata = $scope.get_site.headerdata;
//                    modelSite.savesitedata($scope.get_site);
    }

    //一级菜单添加
    $scope.addheaderparentnav = function(){
        if($scope.header.length==0){
            var headeridindex=1;
        }else{
            var headeridindex=$scope.header[$scope.header.length-1].headerid+1;
        }
        var newheaderdata={
            headerid:headeridindex,
            menuname:$scope.newheaderdata.menuname,
            menutype:$scope.newheaderdata.menutype,
            linkedurl:$scope.newheaderdata.linkedurl,
            linkedpageid:$scope.newheaderdata.linkedpageid,
            linkedpagename:$scope.newheaderdata.linkedpagename,
            childdata:[]
        };

        if(typeof($scope.sitedataFirebase.headerdata) == "undefined"){
            $scope.sitedataFirebase.headerdata=[];
        }
        $scope.sitedataFirebase.headerdata.push(newheaderdata);
//                    modelSite.addHeaderMenu(newheaderdata);
    }

    //添加footer nav
    $scope.addfooternav = function(){
        if($scope.footer.length==0){
            var footeridindex=1;
        }else{
            var footeridindex=$scope.footer[$scope.footer.length-1].footerid+1;
        }
        var newfooterdata={
            footerid:footeridindex,
            footername:$scope.newheaderdata.menuname,
            footertype:$scope.newheaderdata.menutype,
            linkedurl:$scope.newheaderdata.linkedurl,
            linkedpageid:$scope.newheaderdata.linkedpageid,
            linkedpagename:$scope.newheaderdata.linkedpagename
        };

        if(typeof($scope.sitedataFirebase.footerdata) == "undefined"){
            $scope.sitedataFirebase.footerdata=[];
        }
        $scope.sitedataFirebase.footerdata.push(newfooterdata);
//                modelSite.addfooterMenu(newfooterdata);
    }

    //修改footer nav
    $scope.editfooternav = function(){
        footerclass.footername=$scope.newheaderdata.menuname;
        footerclass.footertype=$scope.newheaderdata.menutype;
        footerclass.linkedurl=$scope.newheaderdata.linkedurl;
        footerclass.linkedpageid=$scope.newheaderdata.linkedpageid;
        footerclass.linkedpagename=$scope.newheaderdata.linkedpagename;

        $scope.sitedataFirebase.footerdata = $scope.get_site.footerdata;
//                modelSite.savesitedata($scope.get_site);
    }

    //edit parent menu
    var headclass='';
    $scope.openheaderinfo=function(parentindex,obj,evt){
        insertdata=false;   //当前是操作是修改（方便保存判断）
        headerflag=true;
        var blockcontent = $(evt.target).parent().parent();
        blockcontent.prepend($(".newlink_panel"));
        $scope.csstitleform=true;
        $scope.footercommonfunction();
        $scope.showa=$scope.csstitleform ? parentindex : -1; //选中header当前index
        $scope.showerror=false;
        parentmenuindex=parentindex;   //保存或删除用到时候，parentid
        childmenuindex='';    //判断是否是parent index
        childmenudata='';  //复制当前child所有信息
        headclass=obj;  //复制当前header所有信息
        ishead=true;
        $scope.newheaderdata.menuname=obj.menuname;
        $scope.newheaderdata.menutype=obj.menutype;
        $scope.assignmentform(obj);

        $scope.cssshowdeleteicon = true;
    }


    $scope.footerlia=-1;
    var footerclass='';
    var footerindex='';
    //edit footer menu
    $scope.openfooterinfo=function(evt,obj,index){
        insertdata=false;
        var blockcontent = $(evt.target).parent().parent();
        blockcontent.prepend($(".newlink_panel"));
        $scope.csstitleform=true;
        ishead=false;
        footerindex=index;
        footerclass=obj;
        $scope.footercommonfunction();
        $scope.footerlia=$scope.csstitleform ? obj : -1;
        $scope.newheaderdata.menuname=obj.footername;
        $scope.newheaderdata.menutype=obj.footertype;
        $scope.assignmentform(obj);

        $scope.cssshowdeleteicon = true;
    }

    var headchildclass='';
    //edit child menu
    $scope.openchildinfo=function(childindex,obj,childdata,evt){
        insertdata=false;
        var blockcontent = $(evt.target).parent().parent();
        blockcontent.append($(".newlink_panel"));
        headerflag=false;
        ishead=true;
        headchildclass=obj;
        $scope.csstitleform=true;
        $scope.footercommonfunction();
        $scope.showchilda=$scope.csstitleform ? obj : -1;
        $scope.showerror=false;
        childmenuindex=childindex;
        childmenudata=childdata;
        $("#delete")[0].value='Delete';
        $scope.newheaderdata.menuname=obj.menuname;
        $scope.newheaderdata.menutype=obj.menutype;
        $scope.assignmentform(obj);

        $scope.cssshowdeleteicon = true;
    }

    //delete menu
    $scope.deleteparentmenu=function(evt){
        if(ishead){
            $scope.deleteheadernav();
        }else{
            $scope.deletefooternav();
        }

        $scope.sitedataFirebase.headerdata = $scope.get_site.headerdata;
        $scope.sitedataFirebase.footerdata = $scope.get_site.footerdata;

//        modelSite.savesitedata($scope.get_site);
        $("body").append($(".newlink_panel"));//delete before remove form position,it is must step
        $scope.footercommonfunction();
    }


    //删除header nav
    $scope.deleteheadernav = function(){
        if(childmenuindex===''){
            if(typeof($scope.header[parentmenuindex].childdata) == "undefined"){
                $scope.header[parentmenuindex].childdata = [];
            }
            if($scope.header[parentmenuindex].childdata.length>0){
                $scope.showerror=true;
                return;
            }else{
                $scope.header.splice(parentmenuindex,1);
                $scope.csstitleform=false;
            }
            childmenuindex='';
            childmenudata='';
        }else{
            childmenudata.splice(childmenuindex,1);
            $scope.csstitleform=false;
        }
    }

    //删除footer nav
    $scope.deletefooternav = function(){
        $scope.footer.splice(footerindex,1);
        $scope.csstitleform=false;
    }

    $scope.closetipheader = function(){
        $scope.csstitleform=false;
        $scope.footerlia = -1;
        $scope.footerli = -1;
        $scope.showli = -1;
        $scope.showa = -1;
        $scope.showchilda = -1;
    }

    $scope.showfootmenusetting=function(){
        $scope.cssfootermenubutton = true;
        $scope.cssfootersetting = true;
    }

    $scope.hidefootmenusetting=function(){
        $scope.cssfootermenubutton = false;
        $scope.showfooternavsetting = false;
        $scope.cssfootersetting = false; //隐藏footer的设置面板
    }

    $scope.clickfootertheme = function(indexid, themedata){
        $scope.cssfooterthemeindex = indexid;
        $scope.cssfootermenuhavadata = true;

        $scope.sitedataFirebase.defaultsettings.footerthemeindex = indexid;
    }

    $scope.showfooternavsetting = false;
    $scope.slideshowfootersetting = function(){
        $scope.showfooternavsetting = true;
    }

    $scope.footercommonfunction=function(){
        $scope.showli=-1;
        $scope.showa=-1;
        $scope.showchilda=-1;
        $scope.footerli=-1;
        $scope.footerlia=-1;
    }

    $scope.assignmentform=function(obj){
        if($scope.newheaderdata.menutype=="other"){
            $("#urltype1").attr("checked",true);
            $("#urltype2").attr("checked",false);
            $scope.newheaderdata.linkedurl=obj.linkedurl;
        }else{
            $scope.newheaderdata.linkedurl="";
            $("#urltype1").attr("checked",false);
            $("#urltype2").attr("checked",true);
            $scope.headerlocalurl=obj.linkedpagename;
        }
        setupLabel();  //选中radio 按钮方法
    }
}
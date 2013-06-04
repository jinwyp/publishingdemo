'use strict';

var pageapp = angular.module('pagemodule', []);

/*
pageapp.directive('anyKeypress', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attr, ctrl) {
            element.bind('keypress', function(){
                scope.$apply(function(s) {
                    s.$eval(attr.zKeypress);
                });
            });
        }
    };
});
*/


pageapp.directive('enterKeypress', function(){
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


var page = {
    m:{},
    c:{}
};

pageapp.controller(page.c);

pageapp.factory('modelSite', function(){

    var sitedata = {
        siteid:1,
        sitename:'NewSite',

        pagelist : [
            { siteid:1, pagename:'Homepage', pageid:101, pagetype:10, pagetitle:"Homepage", pageurl:"homepage",  pageorder:1, pagelayoutid:10,
                pagelayoutdata:[
                    {layoutcontainerclass:"span9", layoutcontainerid:1000 , blocks:[
                            {blockid:100, blocktype:1, blockname:"name1",blocklayout:10, blockquantity:6, blocktag:[], blockcategory:[], blocksortby:'date' } ,
                            {blockid:101, blocktype:1, blockname:"name2" } ,
                            {blockid:102, blocktype:1, blockname:"name3" }
                        ]
                    },
                    {layoutcontainerclass:"span3", layoutcontainerid:1000, blocks:[] }
                ]
            },
            { siteid:1, pagename:'Channel2', pageid:102,  pagetype:20, pagetitle:"Ch2", pageurl:"ch2", pageorder:6,  pagelayoutid:10, pagelayoutdata:[] },
            { siteid:1, pagename:'Channel3', pageid:103,  pagetype:20, pagetitle:"Ch3", pageurl:"ch3", pageorder:10, pagelayoutid:10, pagelayoutdata:[] },


            { siteid:1, pagename:'Article', pageid:103, pagetype:11, pagetitle:"article", pageurl:"article", pageorder:0, pagelayoutid:10, pagelayoutdata:[] }
        ],

        headerdata:[
            {headerid:1,headername:'Home',headertype:'localurl',headerurl:'',childdata:[
                {childid:1,childname:'Child1',childtype:'otherurl',childurl:'111.htm'},
                {childid:2,childname:'Child2',childtype:'localurl',chidlurl:''}
            ]},
            {headerid:2,headername:'Page1',headertype:'localurl',headerurl:'',childdata:[]},
            {headerid:3,headername:'Page2',headertype:'otherurl',headerurl:'',childdata:[]}
        ],


        defaultsettings:{
            defaulstSelectedPageIndex:1,
            defaulstSelectedLayoutIndex:0,
            articleTypeId:11,

            pagefilterArticleType:{pagetype:1},
            pagefilterListType:{pagetype:2},
            layoutfilterListType:{layouttype:0}
        }
    };

    var layoutdata = [
        {layoutid: 10, layoutname: '两列1', layouttype : 1, layoutorder:1, layoutcss:'ico_layout_00', layoutimage:'app/img/layout_templete.png', layoutdata:[
            {layoutcontainerclass:"span9", layoutcontainerid:1000, blocks:[]},
            {layoutcontainerclass:"span3", layoutcontainerid:1001, blocks:[]}
            ]},

        {layoutid: 10, layoutname: '两列2', layouttype : 1, layoutorder:2, layoutcss:'ico_layout_01', layoutimage:'app/img/layout_templete_01.png', layoutdata:[
            {layoutcontainerclass:"span3", layoutcontainerid:1002, blocks:[]},
            {layoutcontainerclass:"span9", layoutcontainerid:1003, blocks:[]}
        ]},
        {layoutid: 10, layoutname: '三列1', layouttype : 0, layoutorder:3, layoutcss:'ico_layout_02', layoutimage:'app/img/layout_templete_02.png', layoutdata:[
            {layoutcontainerclass:"span4", layoutcontainerid:1005, blocks:[]},
            {layoutcontainerclass:"span4", layoutcontainerid:1006, blocks:[]},
            {layoutcontainerclass:"span4", layoutcontainerid:1007, blocks:[]}
        ]}
    ];



    var factory = {};
    factory.getSite = function () {
        return  sitedata;
    };

    factory.getPageList = function () {
        return  sitedata.pagelist;
    };

    factory.getSinglePage = function (selectedpage) {
        var pageindex = sitedata.pagelist.indexOf(selectedpage);
        return  sitedata.pagelist[pageindex];
    };

    factory.addSinglePage = function (pagedata) {
        return  sitedata.pagelist.push(pagedata);
    };

    factory.updateSinglePage= function(pagedata){
        return
    };

    factory.delSinglePage= function( pagedata){
        if(pagedata.pagetype >= 20){
            //首页和内容页面都是无法删除的
            var pageindex = sitedata.pagelist.indexOf(pagedata);
            sitedata.pagelist.splice(pageindex, 1);
        }
//        for(var i = sitedata.pagelist.length; i--;){
//            if (sitedata.pagelist[i] === pagedata) {
//                sitedata.pagelist.splice(i, 1);
//            }
//        }
        return
    };

    factory.addSingleBlockToPage = function (newblock, pagelayout, pagedata) {

        var pageindex = sitedata.pagelist.indexOf(pagedata);
        var layoutindex = sitedata.pagelist[pageindex].pagelayoutdata.indexOf(pagelayout);

        pagelayout.blocks.push(newblock);

        sitedata.pagelist[pageindex].pagelayoutdata[layoutindex] = pagelayout;
        return  ;
    };



    //layout 修改
    factory.getLayoutList = function() {
        return  layoutdata;
    }

    factory.saveSinglePageLayout = function( selectedpage, layout) {
        var pageindex = sitedata.pagelist.indexOf(selectedpage);
//        console.log(pageindex, sitedata.pagelist[pageindex].pagename);
        sitedata.pagelist[pageindex].pagelayoutdata = layout.layoutdata ;
        return  ;
    }


    //header 修改
    factory.getHeader=function(){
        return sitedata.headerdata;
    }
    factory.addHeaderPage = function (pagedata) {
        return  sitedata.headerdata.push(pagedata);
    };
    factory.addHeaderChildPage = function (id,pagedata) {
        return  sitedata.headerdata[id].childdata.push(pagedata);
    };


    return factory;
});




/* Controllers */
page.c.Pagelist = function($scope, $location, $http, $routeParams, modelSite) {
    $scope.site = {};
    $scope.pages = [];
    $scope.singlepage = {};
    $scope.newpage ={};
    $scope.layouts = [];
    $scope.header=[];

    initialize();

    function initialize(){
        $scope.site = modelSite.getSite();
        $scope.pages = modelSite.getPageList();
        $scope.singlepage =  $scope.pages[0];   //默认读取首页

        $scope.layouts = modelSite.getLayoutList();
        $scope.header = modelSite.getHeader();

        $scope.pagearticletype = $scope.site.defaultsettings.articleTypeId;    // left menu default selected page
        $scope.pagefilterarticle = $scope.site.defaultsettings.pagefilterArticleType;
        $scope.pagefilterlist = $scope.site.defaultsettings.pagefilterListType;
        $scope.layoutfilterlisttype = $scope.site.defaultsettings.layoutfilterListType;

        $scope.defaultselectedpageindex = $scope.site.defaultsettings.defaulstSelectedPageIndex;    // left menu default selected page
        $scope.selectedpageattributeindex = -1;    //默认隐藏所有page的属性面板

        $scope.selectedpageblockindex = -1;    

        $scope.defaultselectedlayoutindex = $scope.site.defaultsettings.defaulstSelectedLayoutIndex;    // right menu default selected page

        $scope.cssshowpageaddinput = false;    //添加page的输入框默认不显示
        $scope.cssblockbutton = -1;    //添加block的menu的四个按钮mouseover时才显示

        $scope.cssblockiconactive = false;      //点击当前block按钮的选中的样式
        $scope.cssblocktipindexauto = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexeditor = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexstatic = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexads = -1;      //点击当前block按钮显示对应block类型菜单

        $scope.showform = false;
    }



    //left side bar
    $scope.clickpage = function(indexid, page) {
        $scope.defaultselectedpageindex = indexid;
        $scope.singlepage = page;

        if(page.pagetype === $scope.pagearticletype) {
            $scope.layoutfilterlisttype = {layouttype:1 };
        }else{
            $scope.layoutfilterlisttype = {layouttype:0 };
        }

        $scope.cssshowpageaddinput = false;       //添加page的输入框不显示
    }

    $scope.showaddpageinput = function() {
        $scope.cssshowpageaddinput = true;       //添加page的输入框显示
    }
    $scope.showeditpageattribute = function() {
        $scope.csspageattribute = true;       //添加page的输入框显示
    }
    $scope.closeeditpageattribute = function() {
        $scope.csspageattribute = false;       //添加page的输入框显示
    }


    //left side bar add page
    $scope.showaddpageinput = function() {
        $scope.cssshowpageaddinput = true;       //添加page的输入框显示
    }

    $scope.addpage = function() {
        $scope.cssshowpageaddinput = false;       //添加page的输入框显示
        var newpage = {
            siteid:1,
            pagename:$scope.newpage.pagename,
            pageid:103,
            pagetype:20,
            pagetitle:$scope.newpage.pagetitle,
            pageurl:$scope.newpage.pageurl
        }
        modelSite.addSinglePage(newpage);

    }



    //left side bar add page attribute
    $scope.showeditpageattribute = function(indexid) {
        $scope.selectedpageattributeindex = indexid;    //点击显示当前的page 属性面板
    }

    $scope.closeeditpageattribute = function(indexid) {
        $scope.selectedpageattributeindex = -1;    //关闭当前的page 属性面板
    }

    $scope.editsavepage = function(page) {
        $scope.selectedpageattributeindex = -1;    //关闭当前的page 属性面板
        modelSite.updateSinglePage(page);
    }
    $scope.delpage = function( page) {
        $scope.selectedpageattributeindex = -1;    //关闭当前的page 属性面板
        modelSite.delSinglePage(page);
    }

    //right side bar
    $scope.clicklayout = function(indexid, layout) {
        $scope.defaultselectedlayoutindex = indexid;
        modelSite.saveSinglePageLayout($scope.singlepage, layout);
    }





    //add blocks



    $scope.showblockmenubutton = function( indexid) {
        $scope.cssblockbutton = indexid;      //显示当前block的menu按钮
    }
    $scope.hideblockmenubutton = function( indexid) {
        $scope.cssblockbutton = -1;           //显示当前block的menu按钮

    }


    $scope.showblockautomenu = function( indexid, blocktype, event1) {

        $scope.cssblockiconactive = blocktype;      //点击当前block按钮的选中的样式

        $scope.cssblocktipindexauto = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexeditor = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexstatic = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexads = -1;      //点击当前block按钮显示对应block类型菜单

        switch(blocktype)
        {
            case 'auto':
                $scope.cssblocktipindexauto = indexid;      //点击当前block按钮显示对应block类型菜单
                break;
            case  'editor':
                $scope.cssblocktipindexeditor = indexid;      //点击当前block按钮显示对应block类型菜单
                break;
            case  'static':
                $scope.cssblocktipindexstatic = indexid;      //点击当前block按钮显示对应block类型菜单
                break;
            case  'ads':
                $scope.cssblocktipindexads = indexid;      //点击当前block按钮显示对应block类型菜单
                break;
            default:

        }

        var blockcontent = $(event1.target).parent().parent();
        var blocktypemenu = blockcontent.find(".tip_"+blocktype);     //获取样式名称拼接

        var left =  ( parseInt(blockcontent.width() ) - parseInt( blocktypemenu.width() ) )/2;
        blocktypemenu.css({"left":left+"px","top":-(blocktypemenu.height()),"position":"absolute"});

    }

    $scope.clickblocklayouttab = function( event1) {
        //重新计算高度,因为block tab 页面切换了  此处有问题,因为使用了bootstrap的tab切换
        var blockcontent1 = $(event1.target).parent().parent().parent().parent().parent();
        var blocktypemenu1 = blockcontent1.find(".tip_auto");     //获取样式名称拼接
        console.log(blockcontent1.width(), blocktypemenu1.width(), blocktypemenu1.height());
        console.log(blocktypemenu1);
        blocktypemenu1.css({"top":-(blocktypemenu1.height()),"position":"absolute"});
    }


    $scope.addblocktopage = function(layoutcontainer ) {
        var newblock = {
            blockid:200,
            blocktype:1,
            blockname:"name1",
            blocklayout:10,
            blockquantity:6,
            blocktag:[],
            blockcategory:[],
            blocksortby:'date'
        }

        modelSite.addSingleBlockToPage(newblock, layoutcontainer, $scope.singlepage );

        $scope.cssblocktipindexauto = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexeditor = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexstatic = -1;      //点击当前block按钮显示对应block类型菜单
        $scope.cssblocktipindexads = -1;      //点击当前block按钮显示对应block类型菜单



    }














}









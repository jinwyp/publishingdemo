 var vcpapp = angular.module('vcpmodule', [ 'vcpmodule.directive' ]);
 var page = {
     c:{}
 }
 vcpapp.controller(page.c);


 page.c.GlobalCtrl = function($scope, modelSite){
    //加载头部内容
    $scope.header = modelSite.getHeader();

    //加载底部内容
    $scope.footer = modelSite.getfooter();
    $scope.footermaxindex=$scope.footer.length-1 < 0 ? 0 : $scope.footer.length-1;
    $scope.cssblocklayoutselected = 0;

    //加载block内容
    var site = modelSite.getSite();

     $scope.serachlinkdom = function(currentpage){
         for(var i = 0; i < $scope.pages.length; i++){
             if($scope.pages[i].pagename == currentpage){
                 return $scope.pages[i];
             }
         }
     }

     $scope.pages = site.pagelist;
     if($scope.header.length > 0){
         $scope.singlepage = $scope.serachlinkdom($scope.header[0].linkedurl);
     }

     //链接页面
     var copysinglepage='';
     $scope.showCurrent = function(currentpage, index){
         //debugger;
         $scope.showdetails = false;
         $scope.showlist = true;
         $scope.singlepage = $scope.serachlinkdom(currentpage);
         if($scope.singlepage == undefined){
             $scope.singlepage = copysinglepage;
             window.open(currentpage);
         }else{
             copysinglepage = $scope.singlepage;
         }
         $scope.cssblocklayoutselected = index;
     }


     $scope.showheader = '';
     $scope.showtags = '';
     $scope.showdetails = false;
     $scope.showlist = true;
     $scope.showblockname ='';

     //显示详细信息
     $scope.showarticledetail = function(content,blockname){
         $scope.showheader = content.title;
         $scope.showtags = content.tags;
         $scope.showdetails = true;
         $scope.showlist = false;
         $scope.showblockname = blockname;
         document.getElementById("articledetail").innerHTML =content.contentbody;
     }

     //显示列表页面
     $scope.hidearticledetail = function(){
         $scope.showdetails = false;
         $scope.showlist = true;
     }
}
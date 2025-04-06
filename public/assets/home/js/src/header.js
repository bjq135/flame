import toast from "../toast";

export default function () {
  mobileMenu();
  mobileSearch();
  pcNav();
  pcSearch();
  pcAvatarShow();
}


/**
 * 移动端下拉
 */
function mobileMenu(){

  // 显示移动菜单
  var mobileTopMenuButton = document.querySelector('.top-nav-button.menu-button');
  if (!mobileTopMenuButton) {
    return;
  }
  console.log('mobileMenuCloseButton', mobileMenuCloseButton);

  mobileTopMenuButton.addEventListener('click', function () {
    mobileTopMenuButton.classList.add('hidden');
    var mobileDialog = document.querySelector('.mobile-menu-modal');
    mobileDialog.classList.add('show');
    document.querySelector('body').classList.add('no-scroll');
  });

  // 隐藏移动菜单
  var mobileMenuCloseButton = document.querySelector('.action-button.close');
  if (!mobileMenuCloseButton) {
    return;
  }
  // console.log('mobileMenuCloseButton ', mobileMenuCloseButton);
  mobileMenuCloseButton.addEventListener('click', function () {
    var mobileDialog = document.querySelector('.mobile-menu-modal');
    mobileDialog.classList.remove('show');
    document.querySelector('body').classList.remove('no-scroll');
  });

  // 下拉菜单
  var items = document.querySelectorAll(".header.mobile .menu-item-has-children i");
  if(!items) return;
  
  items.forEach(function(i){
    i.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if(i.parentNode.parentNode.querySelector('.child-menu')){
        i.parentNode.parentNode.classList.toggle('active');
      }
    });
  });
}


/**
 * 移动端搜索
 */
function mobileSearch() {
  var mobileTopSearchButton = document.querySelector('.top-nav-button.search-button');
  if (!mobileTopSearchButton) return;

  // 显示移动搜索框
  mobileTopSearchButton.addEventListener('click', function () {
    document.querySelector('#search-modal-dialog').classList.add('show');
    document.querySelector('body').classList.add('no-scroll');
  });

  // 初始化移动搜索框
  var searchForm = document.querySelector(".mobile-search-modal form");
  var searchInput = document.querySelector(".mobile-search-modal input[name='keyword']");
  if (searchForm) {
    searchForm.onkeydown = function (event) {
      if (event.keyCode == 13 && searchInput.value == '') {
        toast.open({ title: "请输入关键词" });
        return false;
      }
    }
  }

  searchForm.onsubmit = function () {
    if (searchInput.value == "") {
      toast.open({ title: "请输入关键词" });
      return false;
    }
  }

  let closeButton = document.querySelector('#search-modal-dialog .modal-close-button');
  if (!closeButton) { return; }
  closeButton.addEventListener('click', function () {
    this.parentNode.parentNode.classList.toggle('show');
    document.querySelector('body').classList.remove('no-scroll');
  });
}



/* PC 端搜索 */
function pcSearch() {
  var searchToggleButton = document.querySelector('.header.pc .search-toggle-button');
  if(searchToggleButton){
    searchToggleButton.addEventListener('click', function(e){
      this.classList.toggle('active');
      if(this.classList.contains('active')){
        document.querySelector('.header.pc .search-widget').classList.add('show');
        var input = document.querySelector('.header.pc .search-widget .keyword');
        var text = input.value;
        input.value = '';
        input.focus();
        input.value = text;
      }else{
        document.querySelector('.header.pc .search-widget').classList.remove('show');
      }
    });
  }
  
  var closeSearchButton = document.querySelector('.header.pc .close-widget a');
  if(closeSearchButton ){
    closeSearchButton.addEventListener('click', ()=>{
      document.querySelector('.header.pc .search-widget').classList.remove('show');
      searchToggleButton.classList.remove('active');
    });
  }

  var searchButton = document.querySelector(".header.pc .search .button");
  if (searchButton) {
    searchButton.addEventListener("click", function (e) {
      e.preventDefault();
      if (!document.querySelector(".keyword").value) {
        toast.open({ title: "请输入关键词" });
        return false;
      } else {
        document.querySelector(".search").submit();
      }
    });
  }
}

/* 导航 */
function pcNav(){
  var items = document.querySelectorAll(".header.pc .menu-item-has-children");
  if(!items) return;
  
  items.forEach(function(i){
    i.addEventListener('mouseenter', function(e){
      if(i.querySelector('.child-menu')){
          i.classList.add('active');
      }
    });
    
    i.addEventListener('mouseleave', function(e){
      if(i.querySelector('.child-menu')){
          i.classList.remove('active');
      }
    });
  });
}

/* 头像点击 */
function pcAvatarShow(){
  var avatarShowButton = document.querySelector('.header-top-avatar');
  if(!avatarShowButton){
    return false;
  }
  
  avatarShowButton.addEventListener('click', function(e){
    this.classList.toggle('active');
    if (this.classList.contains('active')) {
      document.querySelector('.header.pc .user-widget').classList.add('show');
    } else {
      document.querySelector('.header.pc .user-widget').classList.remove('show');
    }
  });
}







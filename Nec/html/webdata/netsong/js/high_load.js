function MouseEnterFun(){
    var call='ShowTipDlg';
    callClientNoReturn(call);
}

function MouseLeaveFun(){
    var call='HideTipDlg';
    callClientNoReturn(call);
}
//绑定相应的事件
function Bindfunc(){
    $('.info_tip_que').live('mouseenter',MouseEnterFun);
    $(".info_tip_que").live("mouseleave", MouseLeaveFun);
    $('.head_close').live("click",CloseExclu);
    $('.head_share').live("click",ShareExcle);
}

function ShowCheckNext(bShow){

    if( bShow ){
        $('#show_next').get(0).style.display = 'block';
        $('#show_next_tip').get(0).style.display = 'block';
        $('.open_conf').removeClass('open_conf_hide');
    }
    else{
        $('#show_next').get(0).style.display = 'none';
        $('#show_next_tip').get(0).style.display = 'none';
        $('.open_conf').addClass('open_conf_hide');
    }
}
function ShowClientWnd(){
    callClientNoReturn('ShowExclMainWnd');
}

$(function(){
    callClientNoReturn('domComplete');
    Bindfunc();
    var url = window.location.href.replace(/###/g, '');
    var bShow = parseInt(getValue(url, 'bshow'));
    ShowCheckNext(bShow);
    ShowClientWnd();
});

function CloseExclu(){
    var Objcheck = document.getElementById('show_next');
    var bChk = Objcheck.checked;
    var boolRet  = bChk == true?1:0;
    callClientNoReturn('closeExclWindow?bchk=' + parseInt(boolRet));
    return false;
}

function ShareExcle()
{
    callClientNoReturn('ShareExclu');
    return false;
}

function OpenExcluMode()
{
    var Objcheck = document.getElementById('show_next');
    var bChk = Objcheck.checked;
    var boolRet  = bChk == true?1:0;
    callClientNoReturn('OpenExcluMode?bchk=' + parseInt(boolRet));
    return false;
}
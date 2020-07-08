let id = JSON.parse(localStorage.getItem('goodsId'))
let uid = JSON.parse(localStorage.getItem('userInfo')).id

var info = []
console.log(id)
getGoodsInfo()
async function getGoodsInfo(){
    await axios.get(
        'http://jx.xuzhixiang.top/ap/api/detail.php',
        {params:{id}}
        ).then(function(res){
            console.log(res)

            var result = res.data.data

            info = result
            bindHtml(info)
        })
}


function bindHtml(info) {
$('.goodsInfo img').attr('src', info.pimg)
$('.goodsInfo .goodsName').text(info.pname)
$('.goodsInfo .price').text('￥' + info.pprice)
}


$('.addCart').click(async function(){
    // console.log('我要添加购物车了')

    // 判断是否登录
    if ($.cookie('username')) {
        console.log('用户登录')
          
        await axios.get(
            'http://jx.xuzhixiang.top/ap/api/add-product.php',
            {params:{
                uid:uid,
                pid:id,
                pnum:1
            }}
        ).then(function(res){
            console.log(res)
        })
        
        

    }else{
        console.log('用户未登录')
        window.location.href='./login.html'
      }
    })
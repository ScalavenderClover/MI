let uid = JSON.parse(localStorage.getItem('userInfo')).id

//请求购物车列表
getCartList()
async function getCartList() {
    //axios请求接口 用户id为请求体
    await axios.get(
        'http://jx.xuzhixiang.top/ap/api/cart-list.php',
        { params: { id: uid } }
    ).then(function (res) {
        console.log(res.data.data)
        let result = res.data.data

        let cartList = result

        cartList.forEach(item => {
            item.isSelect = false
            item.subtotal = item.pprice * item.pnum

        })

        // console.log(cartList)

        // 在存储到 localStorage 里面
        localStorage.setItem('cartList', JSON.stringify(cartList))

        let myCartList = JSON.parse(localStorage.getItem('cartList'))

        bindHtml(myCartList)

        checkEvent(myCartList)
    })
}

function bindHtml(myCartList) {
    // 整体渲染页面
    // 全选按钮需要渲染
    //   判断一下, 如果数组里面每一个数据的 isSelect 都是 true, 就渲染成 true
    //   只要有任意一个数组的 isSelect 是 false. 就渲染成 false
    let selectAll = myCartList.every(item => {
        // 如果每一条都是 true, 就会返回 true
        // 如果任意一条是 false, 就会返回 false
        return item.isSelect === true
    })

    let str = `
      <div class="top">
        <input class="selectAll" type="checkbox" ${ selectAll ? 'checked' : ''}>   全选
      </div>
      <ul class="center">
    `

    myCartList.forEach(item => {
        // 每一条数据的渲染, 根据每一条信息来渲染页面
        str += `
        <li>
          <div class="select">
            <input data-id=${ item.pid} class="selectOne" type="checkbox" ${item.isSelect ? 'checked' : ''} >
          </div>
          <div class="info">
            <div class="cart-product-img">
            <img src="${ item.pimg}" alt="" class="cart-product-img-item">
            </div>
            <div class="cart-product-name">
            <p>${ item.pname}</p>
            </div>
          </div>
          <p class="price">￥${ item.pprice}</p>
          <div class="number">
            <button class="sub" data-id=${ item.pid}>-</button>
            <input type="text" value="${ item.pnum}" class="cart-product-numbers">
            <button class="add" data-id=${ item.pid}>+</button>
          </div>
          <p class="subtotal">￥${ item.subtotal.toFixed(2)}</p>
          <div class="del" data-id=${ item.pid}>删除</div>
        </li>
      `
    })

    // 选中商品数量需要渲染
    //   要把数组中的 isSelect 为 true 的数据的 number 加再一起
    //   数组常用方法叫做 filter 就能筛选数据
    let selectArr = myCartList.filter(item => item.isSelect)
    // console.log(selectArr)

    // 选中商品数量计算
    let selectNumber = 0
    // 选中商品总价
    let selectPrice = 0
    selectArr.forEach(item => {
        selectNumber += parseInt(item.pnum)
        selectPrice += item.subtotal
    })

    // 去支付要不要禁用, 如果没有选中的商品, 就应该禁用
    //   只要有选中的商品, 就应该不禁用
    //   直接使用 selectArr 的 length 来判断

    str += `
      </ul>
      <div class="bottom">
        <p class="select-num">选中商品数量:  <span class="select-num-p">${ selectNumber}</span></p>
        <p class="fee-total">总价： <span class="count-price">￥${ selectPrice.toFixed(2)}</span></p>
        <button class="clear">清空购物车</button>
        <button class="pay" ${ selectArr.length ? '' : 'disabled'}> 去结算 ></button>
      </div>
    `

    // 整体添加到页面的盒子里面
    $('.cart').html(str)
}

function checkEvent(myCartList) {
    
    // 全选按钮
    $('.cart').on('change', '.selectAll', function () {
        // 让数组里面的每一个数据的 isSelect 都变成 自己的状态
        myCartList.forEach(item => {
            item.isSelect = this.checked
        })

        ////重新渲染页面
        bindHtml(myCartList)

        // 在从新存储一遍 localStorage
        localStorage.setItem('cartList', JSON.stringify(myCartList))
    })

    // 单选按钮的事件
    $('.cart').on('change', '.selectOne', function () {
        // console.log($(this).data('id'))
        // 你要知道你点击的是哪一个数据的单选按钮
        const pid = $(this).data('id')

        // 找到数组中 id 一样的那一条数据改变一下 isSelect 属性
        myCartList.forEach(item => {
            if (item.pid == pid) {
                item.isSelect = !item.isSelect
            }
        })

        //重新渲染页面
        bindHtml(myCartList)

        // 存储在lcoalStorage 里面
        localStorage.setItem('cartList', JSON.stringify(myCartList))
    })

    //  减少商品数量的事件
    $('.cart').on('click', '.sub',  function () {
        let pid = $(this).data('id')
        let uid = JSON.parse(localStorage.getItem('userInfo')).id

        // 循环数组, 把 id 对应的这个数据的 number 和 小计修改了
        myCartList.forEach(async item => {
            if (item.pid == pid) {
                // 当 item.number === 1 的时候, 不需要 --
                item.pnum > 1 ? item.pnum-- : ''
                item.subtotal = item.pprice * item.pnum

                let pnum =item.pnum

                if(pnum >=1){
                   await axios.get(
                        'http://jx.xuzhixiang.top/ap/api/cart-update-num.php',
                        {params:{uid,pid,pnum}}
                    ).then(function(res){
                        console.log(res)
                    })
                }
            }
        })

        
        //重新渲染页面
        bindHtml(myCartList)

        // 存储到 localStorage
        localStorage.setItem('cartList', JSON.stringify(myCartList))
    })

    //添加商品数量按钮的事件
    $('.cart').on('click', '.add', function () {
        // 拿到自己身上存储的 id
        let pid = $(this).data('id')

        let uid = JSON.parse(localStorage.getItem('userInfo')).id
        // 方法 1
        // let pObj = myCartList.find(v=> v.pid == pid)
        // console.log(pObj.pnum)

        // let pnum=pObj.pnum

        // console.log(pnum)

        // console.log(this.previousElementSibling.value)

        // this.previousElementSibling.value = parseInt(this.previousElementSibling.value)+1

        // let pnum = this.previousElementSibling.value

        // pObj.pnum = pnum
        // pObj.subtotal= pnum * pObj.pprice

        // console.log(pObj)
        // console.log(myCartList)

        // await axios.get(
        //                'http://jx.xuzhixiang.top/ap/api/cart-update-num.php',
        //                {params:{uid,pid,pnum}}
        //            ).then(function(res){
        //             //    console.log(pnum)
        //                console.log(res)
        //            })

        // 方法2 循环数组找到一个id 对应的数据 
        myCartList.forEach(async item => {
          if (item.pid == pid) {
            item.pnum++
            item.subtotal = item.pnum * item.pprice

            // console.log(item.pnum)
            let pnum =item.pnum

            await axios.get(
                'http://jx.xuzhixiang.top/ap/api/cart-update-num.php',
                {params:{uid,pid,pnum}}
            ).then(function(res){
                console.log(pnum)
                console.log(res)
            })

          }
        })


        // 重新渲染页面
        bindHtml(myCartList)

        // 存储到 localStorage
        localStorage.setItem('cartList', JSON.stringify(myCartList))
      })


      //点击删除的事件 
     
    $('.cart').on('click', '.del',async function () {
        // 获取 按钮id
        let pid = $(this).data('id')
        console.log(pid)
        let uid = localStorage.getItem('uid')
        
        console.log(typeof(uid))
        // var len=cartList.length
        // for (var i=0;i<len;i++){
        //         if(cartList[i].list_id == id){
        //             cartList.splice(i,1)
        //         }
        //  }
        let newCartList= myCartList.filter(item=>{
            return item.pid != pid
        })
        
        myCartList=newCartList

        console.log(myCartList)
        console.log(newCartList)
    
        await axios.get(
            'http://jx.xuzhixiang.top/ap/api/cart-delete.php',
            {params:{uid,pid}}
        ).then(function(res){
            console.log(res.data)
        })


        //渲染
       bindHtml(myCartList)
         
       // 存储到 localStorage
       localStorage.setItem('cartList', JSON.stringify(myCartList))
    })

    //清空购物车
    $('.cart').on('click', '.clear', function () {
        let uid = localStorage.getItem('uid')
        myCartList.forEach(async item =>{
            let pid = item.pid

            await axios.get(
                'http://jx.xuzhixiang.top/ap/api/cart-delete.php',
                {params:{uid,pid}}
            ).then(function(res){
                console.log(res)
            })
        })


        myCartList=[]

        bindHtml(myCartList)

        // 存储到 localStorage
        localStorage.setItem('cartList', JSON.stringify(myCartList))
        
      })
}
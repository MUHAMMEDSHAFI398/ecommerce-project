const user = require('../model/userModal')
const products = require('../model/productModal');
const categories = require('../model/categoryModal');
const order =require('../model/orderModal')



const getAdminLogin = (req, res) => {
    let admin = req.session.admin
    if (admin) {
        res.render('admin/adminHome')
    } else {
        res.render('admin/login')
    }
}


const postAdminLogin = (req, res) => {
    if (req.body.email === process.env.admin_email && req.body.password === process.env.admin_pass) {

        req.session.admin = process.env.admin_email
        res.redirect('/admin')
    } else {
        res.render('admin/login', { invalid: 'invalid username or password ' })

    }
}

const adminLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
}

const getAllusers = async (req, res) => {

    let users = await user.find()
    res.render('admin/userDetails', { users })

}

const blockUser = async (req, res) => {

    const id = req.params.id;
    await user.updateOne({ _id: id }, { $set: { isBlocked: true } }).then(() => {
        res.redirect("/admin/userDetails");
    })
}
const unblockUser = async (req, res) => {
    const id = req.params.id;
    await user.updateOne({ _id: id }, { $set: { isBlocked: false } }).then(() => {
        res.redirect("/admin/userDetails");
    })
}
const addproducts = async (req, res) => {
    let category = await categories.find()
    res.render('admin/addproducts', { category })
}
const productdetails = async (req, res) => {

    let product = await products.find().populate('category')
    res.render("admin/productdetails", { product })

}
const postProduct = async (req, res) => {

    let categoryId =req.body.category
    
    const image = req.files.product_image;
    const Product = new products({
        product_name: req.body.product_name,
        price: req.body.price,
        category: categoryId,
        description: req.body.description,
        stock: req.body.stock
    })
    const productDetails = await Product.save()
    if (productDetails) {
        let productId = productDetails._id;
        image.mv('./public/adminimages/' + productId + '.jpg', (err) => {
            if (!err) {
                res.redirect('/admin/productdetails')
            } else {
                console.log(err)
            }
        })

    }
}
const editProduct = async (req, res) => {

    const id = req.params.id;
    let category = await categories.find()
    const productData = await products.findOne({ _id: id });
    res.render('admin/editproduct', { productData, category })

}
const deleteProduct = async (req, res) => {
    
    const id = req.params.id;
    await products.updateOne({ _id: id }, { $set: { delete: true } })
    res.redirect('/admin/productdetails')

}
const restoreProduct = async (req,res)=>{

    const id = req.params.id;
    await products.updateOne({ _id: id }, { $set: { delete: false } })
    res.redirect('/admin/productdetails')
}
const getcategory = async (req, res) => {

    const Category = await categories.find()

    const categoryExist = req.session.categoryExist
    req.session.categoryExist = ""

    const fieldEmpty = req.session.fieldEmpty
    req.session.fieldEmpty = ""

    const editCategoryExist =req.session.editCategoryExist
    req.session.editCategoryExist = ""

    const editFieldEmpty = req.session.editFieldEmpty
    req.session.editFieldEmpty=""

    res.render('admin/category', { Category, fieldEmpty, categoryExist,editFieldEmpty ,editCategoryExist})

}
const addCategory = async (req, res) => {

    if (req.body.category_name) {
        const category_name = req.body.category_name
        const category = await categories.findOne({ category_name: category_name })

        if (category) {
            req.session.categoryExist = "Category already exist"
            res.redirect('/admin/category')
        } else {
            const Category = new categories({
                category_name: req.body.category_name
            })
            await Category.save()
            res.redirect('/admin/category')
        }
    } else {
        req.session.fieldEmpty = "Field can not be empty"
        res.redirect('/admin/category')
    }




}
const editCategory = async (req, res) => {

    if (req.body.category_name) {

        const category_name = req.body.category_name
        const id = req.params.id;
        const category = await categories.findOne({ category_name: category_name })
        if (category) {

            req.session.editCategoryExist = "Category already exist"
            res.redirect('/admin/category')

        } else {
            await categories.updateOne({ _id: id }, {
                $set: {
                    category_name: req.body.category_name
                }
            });
            res.redirect('/admin/category')
        }
    }else{
        req.session.editFieldEmpty = "Edit field can not be empty"
        res.redirect('/admin/category')
    }


}
const deleteCategory = async (req, res) => {

    const id = req.params.id;
    await categories.deleteOne({ _id: id })
    res.redirect('/admin/category')

}
const postEditProduct = async (req, res) => {

    const id = req.params.id;
    await products.updateOne({ _id: id }, {
        $set: {
            product_name: req.body.product_name,
            price: req.body.price,
            category: req.body.category,
            description: req.body.description,
            stock: req.body.stock
        }
    });
    if (req?.files?.product_image) {
        const image = req.files.product_image;
        image.mv('./public/adminimages/' + id + '.jpg', (err) => {
            if (!err) {
                res.redirect('/admin/productdetails')
            } else {
                console.log(err)
            }
        })
    } else {
        res.redirect('/admin/productdetails')
    }

}
const getOrders = async (req,res)=>{

   let orderDetails= await order.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
      ])
        res.render("admin/orders", { orderDetails });
      
      console.log(orderDetails );
      
      
    
}



module.exports = {

    getAdminLogin,
    postAdminLogin,
    adminLogout, getAllusers,
    blockUser,
    unblockUser,
    addproducts,
    productdetails,
    postProduct,
    editProduct,
    deleteProduct,
    getcategory,
    postEditProduct,
    addCategory,
    editCategory,
    deleteCategory,
    restoreProduct,
    getOrders

}




  


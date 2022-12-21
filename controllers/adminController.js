const user = require('../model/userModal')
const products = require('../model/productModal');
const categories = require('../model/categoryModal');
const order = require('../model/orderModal')
const mongoose = require("mongoose");
const coupon = require('../model/coupen')
const banner = require('../model/banner')
const moment = require("moment");
moment().format();


module.exports = {
    getAdminLogin: async (req, res) => {
        try {
            let admin = req.session.admin
            if (admin) {
                const orderData = await order.find({ orderStatus: { $ne: "cancelled" } });

                const totalRevenue = orderData.reduce((accumulator, object) => {
                    return accumulator + object.totalAmount;
                }, 0);

                const todayOrder = await order.find({
                    orderDate: moment().format("MMM Do YY"),
                    orderStatus: { $ne: "cancelled" }
                });

                const todayRevenue = todayOrder.reduce((accumulator, object) => {
                    return accumulator + object.totalAmount;
                }, 0);

                const start = moment().startOf("month");

                const end = moment().endOf("month");

                const oneMonthOrder = await order.find({ orderStatus: { $ne: "cancelled" }, createdAt: { $gte: start, $lte: end }, })

                const monthlyRevenue = oneMonthOrder.reduce((accumulator, object) => {
                    return accumulator + object.totalAmount;
                }, 0);

                const allOrders = orderData.length;

                const pending = await order.find({ orderStatus: "pending" }).count();

                const shipped = await order.find({ orderStatus: "shipped" }).count();

                const delivered = await order.find({ orderStatus: "delivered" }).count();

                const cancelled = await order.find({ orderStatus: "cancelled" }).count();

                const cod = await order.find({ paymentMethod: "COD" }).count();

                const online = await order.find({ paymentMethod: "Online" }).count();

                const activeUsers = await user.find({ isBlocked: false }).count();

                const product = await products.find({ delete: false }).count();

                const allOrderDetails = await order.find({ paymentStatus: "paid" }, { orderStatus: "delivered" })



                res.render('admin/adminHome',

                    {
                        todayRevenue,
                        totalRevenue,
                        allOrders,
                        pending,
                        shipped,
                        delivered,
                        cancelled,
                        cod,
                        online,
                        monthlyRevenue,
                        activeUsers,
                        product

                    }
                )
            } else {
                res.render('admin/login')
            }

        } catch {
            
            res.render('user/500')
        }

    },
    
    postAdminLogin: (req, res) => {
        try {
            if (req.body.email === process.env.admin_email && req.body.password === process.env.admin_pass) {

                req.session.admin = process.env.admin_email
                res.redirect('/admin')
            } else {
                res.render('admin/login', { invalid: 'invalid username or password ' })

            }

        } catch {
            
            res.render('user/500')
        }

    },
    adminLogout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin');
    },
    getAllusers: async (req, res) => {
        try {
            let users = await user.find()
            res.render('admin/userDetails', { users })
        } catch {
            
            res.render('user/500')

        }

    },

    blockUser: async (req, res) => {

        try {
            const id = req.params.id;
            await user.updateOne({ _id: id }, { $set: { isBlocked: true } }).then(() => {
                res.redirect("/admin/userDetails");
            })
        } catch {
           
            res.render('user/500')
        }

    },
    unblockUser: async (req, res) => {

        try {
            const id = req.params.id;
            await user.updateOne({ _id: id }, { $set: { isBlocked: false } }).then(() => {
                res.redirect("/admin/userDetails");
            })

        } catch {
            
            res.render('user/500')
        }

    },
    addproducts: async (req, res) => {
        try {
            let category = await categories.find()
            res.render('admin/addproducts', { category })
        } catch {
           
            res.render('user/500')
        }

    },
    productdetails: async (req, res) => {

        try {
            let product = await products.find().populate('category')
            res.render("admin/productdetails", { product })

        } catch {
           
            res.render('user/500')
        }


    },
    postProduct: async (req, res) => {

        try {
            let categoryId = req.body.category
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

        } catch {
            
            res.render('user/500')
        }

    },
    editProduct: async (req, res) => {

        try {
            const id = req.params.id;
            let category = await categories.find()
            const productData = await products.findOne({ _id: id });
            res.render('admin/editproduct', { productData, category })

        } catch {
        
            res.render('user/500')
        }


    },
    postEditProduct: async (req, res) => {

        try {
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

        } catch {
           
            res.render('user/500')
        }



    },
    deleteProduct: async (req, res) => {

        try {
            const id = req.params.id;
            await products.updateOne({ _id: id }, { $set: { delete: true } })
            res.redirect('/admin/productdetails')
        } catch {
           
            res.render('user/500')
        }

    },
    restoreProduct: async (req, res) => {
        try {
            const id = req.params.id;
            await products.updateOne({ _id: id }, { $set: { delete: false } })
            res.redirect('/admin/productdetails')

        } catch {
           
            res.render('user/500')
        }

    },


    getcategory: async (req, res) => {

        try {
            const Category = await categories.find()

            const categoryExist = req.session.categoryExist
            req.session.categoryExist = ""

            const fieldEmpty = req.session.fieldEmpty
            req.session.fieldEmpty = ""

            const editCategoryExist = req.session.editCategoryExist
            req.session.editCategoryExist = ""

            const editFieldEmpty = req.session.editFieldEmpty
            req.session.editFieldEmpty = ""

            res.render('admin/category', { Category, fieldEmpty, categoryExist, editFieldEmpty, editCategoryExist })

        } catch {
     
            res.render('user/500')
        }



    },
    addCategory: async (req, res) => {
        try {
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
        } catch {
           
            res.render('user/500')
        }



    },
    editCategory: async (req, res) => {
        try {
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
            } else {
                req.session.editFieldEmpty = "Edit field can not be empty"
                res.redirect('/admin/category')
            }
        } catch {
           
            res.render('user/500')
        }



    },
    deleteCategory: async (req, res) => {

        try {
            const id = req.params.id;
            await categories.updateOne({ _id: id }, { $set: { delete: true } })
            res.redirect('/admin/category')
        } catch {
          
            res.render('user/500')
        }


    },
    restoreCategory: async (req, res) => {
        try {
            const id = req.params.id;
            await categories.updateOne({ _id: id }, { $set: { delete: false } })
            res.redirect('/admin/category')
        } catch {
        
            res.render('user/500')
        }


    },


    getCouponPage: async (req, res) => {
        try {
            const couponData = await coupon.find()
            res.render('admin/coupon', { couponData })
        } catch {
        
            res.render('user/500')
        }

    },
    addCoupon: (req, res) => {
        try {
            const data = req.body;
            const dis = parseInt(data.discount);
            const maxLimit = parseInt(data.maxLimit);
            const discount = dis / 100;

            coupon.create({

                couponName: data.couponName,
                discount: discount,
                maxLimit: maxLimit,
                expirationTime: data.expirationTime,
            })
                .then((data) => {
                    console.log(data);
                    res.redirect("/admin/coupon");
                });
        } catch {
       
            res.render('user/500')
        }
    },
    deleteCoupon: async (req, res) => {
        try {
            const id = req.params.id;
            await coupon.updateOne({ _id: id }, { $set: { delete: true } })
            res.redirect("/admin/coupon");

        } catch {
       
            res.render('user/500')
        }


    },
    restoreCoupon: async (req, res) => {

        try {
            const id = req.params.id;
            await coupon.updateOne({ _id: id }, { $set: { delete: false } })
            res.redirect("/admin/coupon");

        } catch {
          
            res.render('user/500')
        }

    },
    editCoupon: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            coupon
                .updateOne(
                    { _id: id },
                    {
                        couponName: data.couponName,
                        discount: data.discount / 100,
                        maxLimit: data.maxLimit,
                        expirationTime: data.expirationTime,
                    }
                )
                .then(() => {
                    res.redirect("/admin/coupon");
                });
        } catch {
         
            res.render('user/500')

        }

    },
    getOrders: async (req, res) => {
        try {
            order.aggregate([

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
                {
                    $sort: {
                        createdAt: -1
                    }
                },

            ]).then((orderDetails) => {
                res.render("admin/orders", { orderDetails });

            })

        } catch {
          
            res.render('user/500')

        }


    },
    getOrderedProduct: async (req, res) => {

        try {
            const id = req.params.id;
            const objId = mongoose.Types.ObjectId(id);
            const productData = await order.aggregate([
                {
                    $match: { _id: objId },
                },
                {
                    $unwind: "$orderItems",
                },
                {
                    $project: {
                        productItem: "$orderItems.productId",
                        productQuantity: "$orderItems.quantity",
                        address: 1,
                        name: 1,
                        phonenumber: 1

                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    }
                },

                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        address: 1,
                        name: 1,
                        phonenumber: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'productDetail.category',
                        foreignField: "_id",
                        as: "category_name"
                    }
                },
                {
                    $unwind: "$category_name"
                },

            ]);
            res.render('admin/orderedProduct', { productData })


        } catch {
           
            res.render('user/500')
        }

    },
    orderStatuschange: async (req, res) => {

        try {
            const id = req.params.id;
            const data = req.body;
            await order.updateOne(
                { _id: id },
                {
                    $set: {
                        orderStatus: data.orderStatus,
                        paymentStatus: data.paymentStatus,
                    }
                }
            )
            res.redirect("/admin/order");

        } catch {
          
            res.render('user/500')
        }

    },
    salesReport: async (req, res) => {
        try {
            const allOrderDetails = await order.find({
                paymentStatus: "paid",
                orderStatus: "delivered",
            });
            res.render("admin/salesReport", { allOrderDetails });
        } catch {
          
            res.render('user/500')

        }
    },
    dailyReport: (req, res) => {
        try {
            order
                .find({
                    $and: [
                        { paymentStatus: "paid", orderStatus: "delivered" },
                        {
                            orderDate: moment().format("MMM Do YY"),
                        },
                    ],
                })
                .then((allOrderDetails) => {
                    console.log(allOrderDetails)
                    res.render("admin/salesReport", { allOrderDetails });
                });
        } catch {
         
            res.render('user/500')

        }
    },
    monthlyReport: (req, res) => {
        try {
            const start = moment().startOf("month");
            const end = moment().endOf("month");
            order.find({
                $and: [
                    { paymentStatus: "paid", orderStatus: "delivered" },
                    {
                        createdAt: {
                            $gte: start,
                            $lte: end,
                        },
                    },
                ],
            }).then((allOrderDetails) => {
                res.render("admin/salesReport", { allOrderDetails });
            });
        } catch {
    
            res.render('user/500')

        }
    },
    getBanner: async (req, res) => {
        try {
            const banners = await banner.find()
            res.render('admin/banners', { banners })

        } catch {
          
            res.render('user/500')
        }

    },
    addBanner: async (req, res) => {

        try {
            await banner.create({
                offerType: req.body.offerType,
                bannerText: req.body.bannerText,
                couponName: req.body.couponName
            })
            res.redirect('/admin/getBanner')
        } catch {
           
            res.render('user/500')
        }

    },
    editBanner: async (req, res) => {
        try {
            const bannerId = req.params.id
            await banner.updateOne(
                { _id: bannerId },
                {
                    $set: {
                        offerType: req.body.offerType,
                        bannerText: req.body.bannerText,
                        couponName: req.body.couponName
                    }
                }
            )
            res.redirect('/admin/getBanner')

        } catch {
        
            res.render('user/500')
        }
    },
    deleteBanner: async (req, res) => {
        try {
            const bannerId = req.params.id
            await banner.updateOne(
                { _id: bannerId },
                { $set: { isDeleted: true } }
            )
            res.redirect('/admin/getBanner')

        } catch {
        
            res.render('user/500')
        }

    },
    restoreBanner: async (req, res) => {
        try {
            const bannerId = req.params.id
            await banner.updateOne(
                { _id: bannerId },
                { $set: { isDeleted: false } }
            )
            res.redirect('/admin/getBanner')

        } catch {
         
            res.render('user/500')
        }

    },


}



















import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from 'src/DB/models/cart.model';
import { Model, Types } from 'mongoose';
import { type CreateCartDto } from './dto/create-cart.dto';
import { Product } from 'src/DB/models/product.model';
import { Coupon } from 'src/DB/models/coupon.model';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Coupon.name) private couponModel: Model<Coupon>,
  ) {}

  async addToCart(createCartDto: CreateCartDto, req: any) {
    const product = await this.productModel.findById(createCartDto.product);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < createCartDto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const price = product.salePrice;
    const total = price * createCartDto.quantity;

    let cart = await this.cartModel.findOne({ user: req.user.id });
    if (!cart) {
      cart = await this.cartModel.create({
        user: req.user.id,
        items: [
          {
            product: createCartDto.product,
            quantity: createCartDto.quantity,
            price,
            total,
          },
        ],
        subTotal: total,
      });
    } else {
      const itemIdex = cart.items.findIndex(
        (item) => item.product.toString() === createCartDto.product.toString(),
      );
      if (itemIdex > -1) {
        cart.items[itemIdex].quantity += createCartDto.quantity;
        cart.items[itemIdex].total =
          cart.items[itemIdex].quantity * cart.items[itemIdex].price;
      } else {
        cart.items.push({
          product: new Types.ObjectId(createCartDto.product),
          quantity: createCartDto.quantity,
          price,
          total,
        });
      }
    }

    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();

    return cart;
  }

  async updateCart(productId: string, quantity: number, req: any) {
    const cart = await this.cartModel.findOne({ user: req.user.id });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    if (cart.user.toString() !== req.user.id) {
      throw new BadRequestException(
        'You are not authorized to update this cart',
      );
    }
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );
    if (itemIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (quantity > product.stock) {
        throw new BadRequestException('Not enough stock');
      }
      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.total = item.quantity * item.price;
    }

    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();

    return cart;
  }

  findAll() {
    return `This action returns all cart`;
  }

  async findOne(req: any) {
    const cart = await this.cartModel.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name origanPrice discount salePrice image',
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async removeItem(productId: string, req: any) {
    const cart = await this.cartModel.findOne({ user: req.user.id });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const itemindex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );
    if (itemindex === -1) {
      throw new NotFoundException('Product not found in cart');
    }
    cart.items.splice(itemindex, 1);
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();

    return cart;
  }

  async applayCoupon(req: any, code) {
    const cart = await this.cartExsintance(req);
    const coupon = await this.couponModel.findOne({ code });
    if (!coupon) {
      throw new NotFoundException('coupon not found');
    }
    const now = new Date();
    if (coupon.expireAt < now) {
      throw new BadRequestException('coupon is expired');
    }
    const discountAmount = (cart.subTotal * coupon.discountPersentage) / 100;
    const totalAfterDiscount = cart.subTotal - discountAmount;
    cart.discount = coupon.discountPersentage;
    cart.coupon = coupon._id;
    cart.totalAfterDiscount = totalAfterDiscount;
    await cart.save();
    return cart;
  }

  private async cartExsintance(req: any) {
    const cart = await this.cartModel.findOne({ user: req.user.id });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
}

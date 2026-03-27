import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { type CreateCartDto } from './dto/create-cart.dto';

import { CartRepository } from 'src/DB/Repositories/cart.repo';
import { ProductRepository } from 'src/DB/Repositories/product.repo';
import { CouponRepository } from 'src/DB/Repositories/coupon.repo';
import { Request } from 'express';
import { HProductDocument, Variant } from 'src/DB/models/product.model';

@Injectable()
export class CartService {
  constructor(
    private readonly _CartRepo: CartRepository,
    private readonly _ProductRepo: ProductRepository,
    private readonly _CouponRepo: CouponRepository,
  ) {}

  async addToCart(createCartDto: CreateCartDto, req: any) {
    const product = await this._ProductRepo.findById({
      id: createCartDto.product,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    let price: number;
    let stock: number;

    // 🟢 Variant Product
    if (createCartDto.variantId) {
      const variant = product.variants?.find(
        (v) =>
          v.id?.trim().toLowerCase() ===
          createCartDto.variantId?.trim().toLowerCase(),
      );

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (variant.stock < createCartDto.quantity) {
        throw new BadRequestException('Not enough variant stock');
      }

      price = variant.salePrice || 0;
      stock = variant.stock || 0;
    }
    // 🟢 Simple Product
    else {
      if ((product.stock || 0) < createCartDto.quantity) {
        throw new BadRequestException('Not enough product stock');
      }

      price = product.salePrice || 0;
      stock = product.stock || 0;
    }

    const total = price * createCartDto.quantity;

    let cart = await this._CartRepo.findOne({
      filter: { user: req.user.id },
    });

    if (!cart) {
      cart = await this._CartRepo.create({
        user: req.user.id,
        items: [
          {
            product: new Types.ObjectId(product._id.toString()),
            variantId: createCartDto.variantId
              ? createCartDto.variantId
              : undefined,
            quantity: createCartDto.quantity,
            price,
            total,
          },
        ],
        subTotal: total,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === product._id.toString() &&
          (createCartDto.variantId
            ? item.variantId?.toString() === createCartDto.variantId
            : !item.variantId),
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += createCartDto.quantity;
        cart.items[itemIndex].total =
          cart.items[itemIndex].quantity * cart.items[itemIndex].price;
      } else {
        cart.items.push({
          product: new Types.ObjectId(product._id.toString()),
          variantId: createCartDto.variantId
            ? createCartDto.variantId
            : undefined,
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

  async updateCart(
    productId: string,
    quantity: number,
    req: Request,
    variantId?: string,
  ) {
    const cart = await this._CartRepo.findOne({
      filter: { user: req.user?.id },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    if (cart.user.toString() !== req.user?.id) {
      throw new BadRequestException(
        'You are not authorized to update this cart',
      );
    }
    const product = await this._ProductRepo.findOne({
      filter: { _id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    let price = product.salePrice || 0;
    let stock = product.stock || 0;

    if (variantId) {
      const variant = product.variants?.find(
        (v) => v.id?.toString().trim() === variantId.trim().toString(),
      );
      if (!variant) {
        throw new NotFoundException('Variant not found');
      }
      price = variant.salePrice || 0;
      stock = variant.stock || 0;
    }

    const itemIndex = cart.items.findIndex((item) => {
      if (variantId) {
        return (
          item.product.toString() === productId.toString() &&
          item.variantId === variantId
        );
      }
      return item.product.toString() === productId.toString();
    });
    if (itemIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (quantity > stock) {
        throw new BadRequestException('Not enough stock');
      }
      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.total = item.quantity * price;
    }

    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    await cart.save();

    return cart;
  }

  async findOne(req: any) {
    const cart = await this._CartRepo.findOne({
      filter: { user: req.user.id },
      options: {
        populate: {
          path: 'items.product',
          model: 'Product',
          select: 'name originalPrice discount salePrice image stock variants',
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // إعادة تشكيل الكارت بالشكل المبسط
    const simplifiedCart = {
      id: cart.id,
      user: cart.user,
      items: cart.items.map((item) => {
        const product = item.product as unknown as HProductDocument;
        // Type guard to ensure product is populated
        // Type guard to ensure product is populated
        if (
          !product ||
          typeof product === 'string' ||
          !('variants' in product)
        ) {
          throw new NotFoundException('Product data not properly populated');
        }
        const hasVariants =
          Array.isArray(product.variants) && product.variants.length > 0;

        // لو فيه variant محدد
        const variantData = hasVariants
          ? (product.variants as Variant[]).find((v) => v.id === item.variantId)
          : null;

        return {
          productId: product.id,
          name: product.name,
          image: product.image.map((img) => img.secure_url),
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          ...(variantData
            ? {
                variant: {
                  id: variantData.id,
                  name: variantData.name,
                  salePrice: variantData.salePrice,
                  originalPrice: variantData.originalPrice,
                  discount: variantData.discount,
                  stock: variantData.stock,
                },
              }
            : {}),
        };
      }),
      subTotal: cart.subTotal,
      discount: cart.discount,
      totalAfterDiscount: cart.totalAfterDiscount,
    };

    return simplifiedCart;
  }
  async removeItem(productId: string, req: Request, variantId?: string) {
    const cart = await this._CartRepo.findOne({
      filter: { user: req.user?.id },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const isSameItem = (item: any) => {
      const sameProduct = item.product.toString() === productId.toString();

      const sameVariant = variantId
        ? item.variantId?.toString() === variantId.toString()
        : !item.variantId;

      return sameProduct && sameVariant;
    };

    const itemIndex = cart.items.findIndex(isSameItem);

    if (itemIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }

    cart.items.splice(itemIndex, 1);

    cart.subTotal = cart.items.reduce((sum, item) => sum + item.total, 0);

    await cart.save();

    return cart;
  }

  async applayCoupon(req: any, code) {
    const cart = await this.cartExsintance(req);
    const coupon = await this._CouponRepo.findOne({ filter: { code } });
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
    const cart = await this._CartRepo.findOne({
      filter: { user: req.user.id },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
}

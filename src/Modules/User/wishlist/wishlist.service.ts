import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ProductRepository } from 'src/DB/Repositories/product.repo';
import { WishlistRepository } from 'src/DB/Repositories/wishlist.repo';

@Injectable()
export class WishlistService {
  constructor(
    private readonly _productRepo: ProductRepository,
    private readonly _wishlistRepo: WishlistRepository,
  ) {}

  async addToWishlist(product: string, req: Request) {
    const productExistnce = await this._productRepo.findById({
      id: new Types.ObjectId(product),
    });
    if (!productExistnce) {
      throw new NotFoundException('Product not found');
    }

    const wishlist = await this._wishlistRepo.findOne({
      filter: { user: req.user?._id },
    });

    if (!wishlist) {
      const newWishlist = await this._wishlistRepo.create({
        user: req.user?._id,
        items: [{ product: new Types.ObjectId(product) }],
      });
      return newWishlist;
    }

    /// toggle add / remove product from wishlist
    const index = (wishlist?.items || []).findIndex((item) => {
      return item.product.toString() === product;
    });

    if (index !== -1 && wishlist) {
      // remove product from wishlist
      wishlist!.items.splice(index, 1);
    } else {
      // add product to wishlist
      wishlist!.items.push({ product: new Types.ObjectId(product) });
    }
    await wishlist?.save();
    return {
      message:
        index !== -1
          ? 'Product removed from wishlist'
          : 'Product added to wishlist',
      wishlist,
    };
  }

  async getWishlist(req: Request) {
    const wishlist = await this._wishlistRepo.findOne({
      filter: { user: req.user?._id },
      options: {
        populate: {
          path: 'items.product',
          select: 'name price description image',
        },
      },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }
}

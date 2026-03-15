import { Types } from "mongoose";
import z from "zod";


export const wishlistSchema  = z.strictObject({
    product : z.string().refine((value) => {
        return Types.ObjectId.isValid(value)
    }, {
        message: "Product is required"
    })
})

export type WishlistDto = z.infer<typeof wishlistSchema>
import { IsMongoId, IsString, Length } from "class-validator";
import { Types } from "mongoose";

export class CreateBrandDto {

    @IsString()
    @Length(3, 20)
    name:string;
    @IsString()
    image:string;
    @IsMongoId()
    createdBy:Types.ObjectId;
}

//class validator 

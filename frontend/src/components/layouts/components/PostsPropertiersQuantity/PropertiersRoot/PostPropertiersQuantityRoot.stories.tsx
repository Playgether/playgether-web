import {Meta, StoryObj} from "@storybook/react"
import PostPropertiersQuantityRoot, { PostPropertiersQuantityRootInterface } from "./PostPropertiersQuantityRoot"
import { PostPropertiers } from "../index"
import React from "react"
import { LikeContentType } from "../../../../content_types/LikeContentType"

const meta:Meta<PostPropertiersQuantityRootInterface> =  {
    component:PostPropertiersQuantityRoot,
    tags:['autodocs'],
    parameters:{
        layout:'centered',
    },
}

export default meta

type Story = StoryObj<PostPropertiersQuantityRootInterface>;

/** Nesta versão possuem os três tipos, comentários, likes, e reposts */
export const WithLikesCommentsAndReposts: Story = {
    args:{
        children:(
        <>
            <PostPropertiers.Like quantity_likes={120} user_already_like={true} content_type={LikeContentType.post} object_id={1}/>
            <PostPropertiers.Comment quantity_comment={50} />
            <PostPropertiers.Share quantity_reposts={42} />
        </>
        )
    }
};

/** Perceba que nesta variação só possui likes, sem comentários e reposts*/
export const JustLike: Story = {
    args:{
        children:<PostPropertiers.Like quantity_likes={120} user_already_like={true} content_type={LikeContentType.post} object_id={1}/>
    }
}

/** Perceba que nesta variação só possui Likes e comentários, sem os reposts */
export const JustLikeAndComments: Story = {
    args:{
        children:(
        <>
            <PostPropertiers.Like quantity_likes={120} user_already_like={true} content_type={LikeContentType.post} object_id={1}/>
            <PostPropertiers.Comment quantity_comment={42} />
        </>
        )
    }
}

/** Perceba que a cor de fundo e o tamanho do background mudaram ao passar propriedades para o className*/
export const WithClassName: Story = {
    args:{
        children:(
        <>
            <PostPropertiers.Comment quantity_comment={50} />
            <PostPropertiers.Like quantity_likes={120} user_already_like={true} content_type={LikeContentType.post} object_id={1}/>
            <PostPropertiers.Comment quantity_comment={42} />
        </>
        ),
        className:"bg-gray-200 h-20 w-60 flex justify-center items-center"
    }
};




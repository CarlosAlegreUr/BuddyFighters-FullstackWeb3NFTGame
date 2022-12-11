import Image from "next/image"

import NftTraits from "./NftTraits"

export default function NftShowcase({ imageUrl }) {
    imageUrl = "/example-pokemon.png"
    return (
        <section className="nft-showcase">
            <Image
                src={imageUrl}
                width="200"
                height="200"
            />
            <NftTraits name="Pikamew" rarity="Legendary"/>
        </section>
    )
}

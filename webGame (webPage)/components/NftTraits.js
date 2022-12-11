export default function NftTraits({ name, rarity, stats }) {
    stats = [
        {
            name: "HP",
            value: "255",
        },
        {
            name: "ATTCK",
            value: "255",
        },
        {
            name: "SPCL ATTCK",
            value: "255",
        },
        {
            name: "DEF",
            value: "255",
        },
        {
            name: "SPCL DEF",
            value: "255",
        },
        {
            name: "SPEED",
            value: "255",
        },
    ]
    return (
        <div>
            <h3> {name} </h3>
            <h4>{rarity}</h4>
            {stats.map((stat) => {
                return (
                        <p>
                            {stat.name} : {stat.value}
                        </p>
                )
            })}
        </div>
    )
}

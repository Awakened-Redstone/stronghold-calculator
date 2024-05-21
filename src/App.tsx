import './App.scss'
import React, {ReactNode, useCallback, useEffect, useState} from "react";

function CreditItem({task, name}: { task: string, name: string }) {
  return (
    <div className={"cursor-help credit m-2"}>
      <div className={"credit-description"}>{task} by {name}</div>
      <img className={"pixel-perfect"} src={`/credits/${name}.png`} alt={task}/>
    </div>
  );
}

function Input({label, id, ...props}: {
  label: string,
  id: string
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  return (
    <div className={"w-fit m-auto xl:mx-none"}>
      <label htmlFor={id}>{label}</label>
      <input id={id} pattern="-?[\d]+(\.[\d]+)?" required {...props}/>
    </div>
  );
}

export function ErrorMessage({children}: {children: ReactNode}) {
  return (
    <div className={"error"}>
      {children}
    </div>
  );
}

const titles = [
  "Stronghold triangulator",
  "The Stronghold triangulator",
  "Ultimate Stronghold calculator",
  "Stronghold calculator",
  "Stronghold math thing",
  "Ender eye math",
  "Triangulator 3000",
];

let timer: unknown | null = null;

function degrees_to_radians(deg: number): number {
  return deg * (Math.PI / 180);
}

function cot(deg: number): number {
  if (deg === 0.0 || deg === 180.0) {
    throw "Tangent of 0.0 and 180.0 degrees is zero.\nConsider adding a 0.01 to get results.";
  }
  const rad = degrees_to_radians(deg);
  return 1 / Math.tan(rad);
}


function App() {
  const [random] = useState(Math.round(Math.random() * (titles.length - 1)));
  const [coords1, setCoords1] = useState(['', '', ''] as string[]);
  const [coords2, setCoords2] = useState(['', '', ''] as string[]);
  const [output, setOutput] = useState(<></>);

  const coords = useCallback(() => {
    const [x1, z1, a1] = coords1.map(v => parseFloat(v));
    const [x2, z2, a2] = coords2.map(v => parseFloat(v));

    if (a1 === a2) {
      return "The angles can't be the same";
    }

    if ([x1, z1, a1, x2, z2, a2].includes(NaN)) {
      return "Please only inset valid numbers";
    }

    const x = (z1 - z2 + cot(a1) * x1 - cot(a2) * x2) / (cot(a1) - cot(a2));
    const z = -cot(a1) * (x - x1) + z1;

    return [x.toFixed(0), z.toFixed(0), (x / 8).toFixed(0), (z / 8).toFixed(0)];
  }, [coords1, coords2]);

  useEffect(() => {
    if (timer) return;

    navigator.clipboard.readText().then(() => {
      if (timer) return;

      let firstCoord = "";
      timer = setInterval(async () => {
        const content = await navigator.clipboard.readText();
        if (content.charAt(0) == '/' && content.startsWith("/execute in minecraft:overworld run tp @s")) {
          if (firstCoord.length == 0) {
            firstCoord = content;

            const parts = content.substring(42).split(" ");
            setCoords1([parts[0], parts[2], parts[3]]);
          } else if (content !== firstCoord) {
            const parts = content.substring(42).split(" ");
            setCoords2([parts[0], parts[2], parts[3]]);
          }
        }
      }, 500);
    }).catch(() => {
    });
  }, []);

  useEffect(() => {
    if (coords1.includes('') || coords2.includes('')) {
      setOutput(<></>);
      return;
    }

    try {
      const res = coords();

      if (typeof res === "string") {
        setOutput(<ErrorMessage>{res}</ErrorMessage>);
        return;
      }

      const [x, z, netherX, netherZ] = res;

      setOutput(
        <>
          The stronghold is located around<br/>
          {x}, {z} in the Overworld<br/>
          {netherX}, {netherZ} in the Nether
        </>
      );
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOutput(<ErrorMessage>{e as any}</ErrorMessage>)
    }
  }, [coords, coords1, coords2]);

  return (
    <>
      <div id="credits-button" className={"cursor-help top-8"}>Credits</div>
      <div id="credit-sidebar" className={"top-8"}>
        <div className="credits">
          <CreditItem task="Calculations" name="samkomododragon"/>
          <CreditItem task="Main code" name="BarBar31"/>
          <CreditItem task="UI and QoL features" name="AwakenedRedstone"/>
          <CreditItem task="Page responsiveness" name="Bawnorton"/>
        </div>
      </div>

      <h1>{titles[random]}</h1>
      <div className={"leading-none text-center text-xl"}>
        <span className={"label"}>We use the clipboard for easy usage</span><br/>
        <span className={"label"}>Simply press F3 + C in Minecraft and come back</span>
      </div>

      <div className={"inputs"}>
        <div className={"flex flex-wrap pt-12 gap-6 flex-col xl:flex-row justify-center w-full"}>
          <Input
            label={"X coord:"}
            id={"x1"}
            value={coords1[0]}
            onInput={event => {
              const target = (event.target as HTMLInputElement)
              setCoords1([target.value, coords1[1], coords1[2]])
            }}
          />
          <Input
            label={"Z coord:"}
            id={"z1"}
            value={coords1[1]}
            onInput={event => {
              const target = (event.target as HTMLInputElement)
              setCoords1([coords1[0], target.value, coords1[2]])
            }}
          />
          <Input
            label={"Angle:"}
            id={"angle1"}
            value={coords1[2]}
            onInput={event => {
              const target = (event.target as HTMLInputElement)
              setCoords1([coords1[0], coords1[1], target.value])
            }}
          />
        </div>
        <div className={"flex flex-wrap pt-12 gap-6 flex-col xl:flex-row justify-center w-full"}>
          <Input
            label={"X coord:"}
            id={"x2"}
            value={coords2[0]}
            onInput={event => {
              const target = (event.target as HTMLInputElement)
              setCoords2([target.value, coords2[1], coords2[2]])
            }}
          />
          <Input
            label={"Z coord:"}
            id={"z2"}
            value={coords2[1]}
            onInput={event => {
              const target = (event.target as HTMLInputElement)
              setCoords2([coords2[0], target.value, coords2[2]])
            }}
          />
          <Input
            label={"Angle:"}
            id={"angle2"}
            value={coords2[2]}
            onInput={event => {
              const target = (event.target as HTMLInputElement)
              setCoords2([coords2[0], coords2[1], target.value])
            }}
          />
        </div>
      </div>
      <div className={"mx-auto pt-16 inputs max-w-[95vw]"}>
        <label htmlFor={"output"}>Estimated position:</label>
        <div id={"output"} className={"mock-input output w-full min-h-[12em] relative"}>
          <button
            className={"copy pixel-perfect absolute"}
            disabled={(coords1.includes('') || coords2.includes('')) || (coords1[2] == coords2[2])}
            onClick={() => {
              const res = coords();

              if (res == null) {
                setOutput(
                  <ErrorMessage>
                    Copy failed, angles should not be equal
                  </ErrorMessage>
                );
                return;
              }

              const [x, z, netherX, netherZ] = res;
              navigator.clipboard.writeText(`Overworld: ${x}, ${z} | Nether: ${netherX}, ${netherZ}`);
            }}
          />
          {output}
        </div>
      </div>
    </>
  )
}

export default App

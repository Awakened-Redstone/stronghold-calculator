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

function Input({label, id, large = false, ...props}: {
  label: string
  large?: boolean
  id: string
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  return (
    <div className={`${large ? "xl:w-full" : "w-fit"} m-auto xl:mx-none`}>
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

const constants = {
  coord: ["X", "Y", "Z"]
}

/*let timer: unknown | null = null;*/

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
  const [inputMode, setInputMode] = useState([false, false] as boolean[]);
  const [advancedInput, setAdvancedInput] = useState(['', ''] as string[]);
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
      return "Please only insert valid numbers";
    }

    const x = (z1 - z2 + cot(a1) * x1 - cot(a2) * x2) / (cot(a1) - cot(a2));
    const z = -cot(a1) * (x - x1) + z1;

    return [x.toFixed(0), z.toFixed(0), (x / 8).toFixed(0), (z / 8).toFixed(0)];
  }, [coords1, coords2]);

  /*useEffect(() => {
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
  }, []);*/

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

  const inputData: {
    coords: string[];
    setCoords: (value: (((prevState: string[]) => string[]) | string[])) => void
  }[] = [
    {coords: coords1, setCoords: setCoords1},
    {coords: coords2, setCoords: setCoords2}
  ]

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
      {/*<div className={"leading-none text-center text-xl"}>
        <span className={"label"}>We use the clipboard for easy usage</span><br/>
        <span className={"label"}>Simply press F3 + C in Minecraft and come back</span>
      </div>*/}

      <div className={"inputs"}>
        {
          inputData.map((vals, i) => {
            const {coords, setCoords} = vals;
            return (
              <div className={"flex pt-12 gap-6 flex-col xl:flex-row justify-center w-full"}>
                <div className={"flex flex-col items-center"}>
                  <div className={"label"}>F3+C</div>
                  <input
                    type={"checkbox"} className={"pixel-perfect"}
                    onChange={event => {
                      const newValue = [...inputMode];
                      newValue[i] = event.target.checked;
                      console.log(newValue);
                      setInputMode(newValue);
                    }}
                  />
                </div>
                {
                  !inputMode[i] ? coords.map((_, index) => {
                    return <Input
                      type={"text"}
                      label={`${constants.coord[index]} coord:`}
                      id={`${constants.coord[index]}${i}`}
                      value={coords[index]}
                      onInput={event => {
                        const target = (event.target as HTMLInputElement)
                        const newCoords = [...coords];
                        newCoords[index] = target.value;
                        setCoords(newCoords);
                      }}
                    />
                  }) : <Input
                    large={true}
                    type={"text"}
                    label={"F3+C output:"}
                    id={`f3c${i}`}
                    value={advancedInput[i]}
                    className={"w-full"}
                    onInput={event => {
                      const content = (event.target as HTMLInputElement).value

                      const newValue = [...advancedInput];
                      newValue[i] = content;
                      setAdvancedInput(newValue);

                      if (content.startsWith("/execute in minecraft:overworld run tp @s")) {
                        const parts = content.substring(42).split(" ");
                        setCoords([parts[0], parts[2], parts[3]]);
                      }
                    }}
                  />
                }
              </div>
            )
          })
        }
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

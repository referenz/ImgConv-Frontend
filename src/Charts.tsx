import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import readableFilesize from './readableFilesize';
import { Form, FormCheck } from 'react-bootstrap';

type manifest = {
    inputfile: {
        filesize: number,
    },
    png: {
        filesize: number,
    },
    jpegs: Record<string, any>,
    webps: Record<string, any>,
}

interface ICharts {
    manifest: manifest 
}

function Charts(props: ICharts) {
    const myCanvas = useRef<HTMLCanvasElement>(null);
    const myChart = useRef<Chart | null>(null)
    const [showOriginal, setShowOriginal] = useState<boolean>(true);
    const [showPNG, setShowPNG] = useState<boolean>(true);

    const handleChange = (item: string) => {
        if (item === 'png') setShowPNG(!showPNG);
        else if (item === 'original') setShowOriginal(!showOriginal);
    }

    useEffect(() => {
        function fillData(manifest: manifest): [string[], number[], string[]] {
            let labels: string[] = [];
            let sizes: number[] = [];
            let bgcolor: string[] = [];
        
            // Inputfile
            if (showOriginal === true) {
                labels.push('Originaldatei');
                sizes.push(manifest.inputfile.filesize);
                bgcolor.push('rgba(136, 140, 160, 0.5)');
            }
            
            // JPEG
            for (const jpeg of Object.entries(manifest.jpegs)) {
                labels.push('JPEG, Q ' + jpeg[1].quality);
                sizes.push(jpeg[1].filesize);
                bgcolor.push('rgba(239, 145, 57, 0.5)');
            }
            
            // PNG 
            if (showPNG === true) {
                labels.push('PNG');
                sizes.push(manifest.png.filesize);
                bgcolor.push('rgba(60, 239, 57, 0.5)');
            }
        
            // WebP
            for (const webp of Object.entries(manifest.webps)) {
                labels.push('WebP, Q ' + webp[1].quality);
                sizes.push(webp[1].filesize);
                bgcolor.push('rgba(57, 87, 239, 0.5)');
            }
        
            sizes = sizes.map(curr => readableFilesize(curr));
            return [labels, sizes, bgcolor];
        }

        const [labels, data, bgcolor] = fillData(props.manifest);

        Chart.register(...registerables);

        if (!myChart.current) {
            myChart.current = new Chart(myCanvas.current as HTMLCanvasElement, {
                type: 'bar',
                data: {
                    // Original, JPEG, PNG, WebP
                    labels: labels,
                    datasets: [{
                        label: 'Gr????e in kiB',
                        data: data,
                        backgroundColor: bgcolor,
                    }],
                },
                options: {
                    maintainAspectRatio: true,
                    responsive: true,
                    aspectRatio: 3,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'kiB'
                            },
                            beginAtZero: true,
                        }
                    }
                }
            })
        }  else {
            myChart.current.data = {
                labels: labels,
                datasets: [{
                    label: 'Gr????e in kiB',
                    data: data,
                    backgroundColor: bgcolor,
                }]
            };
            myChart.current.update();
        }
    },[props.manifest, showOriginal, showPNG])

    return <>
        <canvas ref={myCanvas} />
        <Form>
            <FormCheck type="checkbox" inline id="showOriginal" label="Original in Auswertung einbeziehen" 
                checked={showOriginal} onChange={e => handleChange('original')} />
            <FormCheck type="checkbox" inline id="showPNG" label="PNG in Auswertung einbeziehen" 
                checked={showPNG} onChange={e => handleChange('png')} />
        </Form>
    </>

}

export default Charts;
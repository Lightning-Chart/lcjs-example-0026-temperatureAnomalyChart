/*
 * LightningChart JS Example that showcases embedding animated GIF icons inside XY charts.
 */

// Import LightningChartJS
const lcjs = require('@arction/lcjs')

const { lightningChart, AxisTickStrategies, UIElementBuilders, UIOrigins, ImageFill, emptyLine, ImageFitMode, emptyFill, Themes } = lcjs

const chart = lightningChart()
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('')

const axisY1 = chart.getDefaultAxisY().setTitle('Atmospheric Carbon Dioxide (ppm)')

const axisY2 = chart
    .addAxisY({
        opposite: true,
    })
    .setTitle('Temperature Anomaly Index (°C)')
    // Hide tick grid-lines from second Y axis.
    .setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
        ticks
            .setMinorTickStyle((minor) => minor.setGridStrokeStyle(emptyLine))
            .setMajorTickStyle((major) => major.setGridStrokeStyle(emptyLine)),
    )

const axisX = chart.getDefaultAxisX().setTickStrategy(AxisTickStrategies.DateTime)

// Fetch example data sets.
fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + `examples/assets/0026/anomaly-data.json`)
    .then((r) => r.json())
    .then((data) => {
        const { temperature, co2 } = data

        // Visualize Atmospheric Carbon Dioxide (ppm).
        const carbonDioxideSeries = chart
            .addLineSeries({
                yAxis: axisY1,
            })
            .setName('Atmospheric Carbon Dioxide (ppm)')
            // Data set contains PPM measurement values only. First measurement is from year 1880, and each consecutive measurement is 1 year after previous.
            .add(
                co2.map((ppm, i) => ({
                    y: ppm,
                    x: new Date(1880 + i, 0, 1, 0, 0, 0, 0).getTime(),
                })),
            )

        // Visualize Temperature Anomaly Index (°C).
        const temperatureAnomalyIndexSeries = chart
            .addLineSeries({
                yAxis: axisY2,
                // Specify index for automatic color selection. By default this would be 1, but a larger number is supplied to increase contrast between series.
                automaticColorIndex: 2,
            })
            .setName('Temperature Anomaly Index (°C)')
            // Data set contains PPM measurement values only. First measurement is from year 1880, and each consecutive measurement is 1 year after previous.
            .add(
                temperature.map((index, i) => ({
                    y: index,
                    x: new Date(1880 + i, 0, 1, 0, 0, 0, 0).getTime(),
                })),
            )

        // Add legend.
        const legend = chart
            .addLegendBox(undefined, { x: axisX, y: axisY1 })
            .add(chart)
            // Move to non-default location, top left of chart.
            .setOrigin(UIOrigins.LeftTop)
            .setMargin(4)
        const positionLegendOnAxes = () => legend.setPosition({ x: axisX.getInterval().start, y: axisY1.getInterval().end })
        positionLegendOnAxes()
        axisX.onIntervalChange(positionLegendOnAxes)
        axisY1.onIntervalChange(positionLegendOnAxes)

        // Add thundercloud icons to predefined X and Y2 (anomaly index) axis locations.
        const video = document.createElement('video')
        video.crossOrigin = ''
        video.autoplay = true
        video.muted = true
        video.loop = true
        video.src =
            new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + `examples/assets/0026/thundercloud.webm`
        video.load()
        video.addEventListener('loadeddata', (e) => {
            video.play()
            const thunderCloudPositions = [
                { x: new Date(1962, 0, 1).getTime(), y: 0.15 },
                { x: new Date(1999, 0, 1).getTime(), y: 0.7 },
            ]
            const thunderCloudImgSize = { x: video.videoWidth, y: video.videoHeight }
            const thunderCloudImgAspectRatio = thunderCloudImgSize.y / thunderCloudImgSize.x
            // NOTE: Visible icon size can be affected by device pixel ratio.
            const thunderCloudIconSizePx = { x: 100, y: 100 * thunderCloudImgAspectRatio }
            thunderCloudPositions.forEach((position) => {
                // UI Picture Icon can be created by creating a TextBox, removing text and controlling the icons size by padding.
                const uiIcon = chart
                    .addUIElement(UIElementBuilders.TextBox, { x: axisX, y: axisY2 })
                    .setPosition(position)
                    .setOrigin(UIOrigins.CenterBottom)
                    .setTextFillStyle(emptyFill)
                    .setPadding({ left: thunderCloudIconSizePx.x, top: thunderCloudIconSizePx.y })
                    .setBackground((background) =>
                        background.setStrokeStyle(emptyLine).setFillStyle(
                            new ImageFill({
                                source: video,
                                fitMode: ImageFitMode.Fit,
                            }),
                        ),
                    )
            })
        })
    })

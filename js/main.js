let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 0.96 * _height;
let padding = {'left': 0.25*width, 'bottom': 0.1*height, 'top': 0.2*height, 'right': 0.1*width};
let x_attr = 'Ph.D. Graduation Year';
let y_attr = 'Publications';
let radius = 'Publications Divided by Co-authors';
let isColored = false;
let subtitle = 'Scatter Points';
let institutionColors = {
    'Zhejiang University':'#0f4894',
    'University of Wisconsin - Madison':'#9a203e',
    'University of Washington':'#533788',
    'University of Toronto':'#0b3362',
    'University of Texas at Austin':'#cc5318',
    'University of Pennsylvania':'#0c1e55',
    'University of Michigan':'#fecd19',
    'University of Maryland - College Park':'#d7353e',
    'University of Illinois at Urbana-Champaign':'#e75132',
    'University of California - San Diego':'#0e719a',
    'University of California - Los Angeles':'#35508b',
    'University of California - Berkeley':'#0c3c69',
    'Tsinghua University':'#732bac',
    'The Hong Kong University of Science and Technology':'#263f6a',
    'Swiss Federal Institute of Technology Zurich':'#2c2c2c',
    'Stanford University':'#b41d1a',
    'Shanghai Jiao Tong University':'#ca2128',
    'Peking University':'#91180b',
    'Nanjing University':'#6a1a66',
    'Massachusetts Institute of Technology':'#0d393b',
    'Israel Institute of Technology':'#0d1440',
    'Georgia Institute of Technology':'#b6a770',
    'Fudan University':'#2a57a3',
    'Cornell University':'#b62226',
    'Columbia University':'#1451a7',
    'Chinese University of Hong Kong':'#742675',
    'Carnegie Mellon University':'#c6223a'
};
let categories = ['H-index','Publications','Citations','Publications Divided by Co-authors','Ph.D. Graduation Year'];
let schools,years,fontFamily;
let svg;
let x,axis_x,x_axis,x_label,y,axis_y,y_axis,y_label;
let r,points,Institution,Year,X,Y,R,tooltip;
let institution='all',year='all';
let _data,sumxz,schools_,sum_school,rects,texts;
let arcPath;
function fill(d){
    if(isNaN(d[x_attr]) || isNaN(d[y_attr]) || isNaN(d[radius]) )
        return 'none';
    else if(institution!=='all' && d['Institution']!==institution)
        return 'none';
    else if(year!=='all' && d['Ph.D. Graduation Year']!== +(year))
        return 'none';
    else if(isColored)
        return institutionColors[d['Institution']]
    else
        return '#1f77b4'
}
function setTooltip(x,y,d){
    // show a tooltip
    let name = d['First Name'] + ' ' + d['Mid Name'] + ' ' + d['Last Name'];
    let institution = d['Institution'];
    let grad_year = d['Ph.D. Graduation Year'];
    let grad_school = d['Ph.D. Graduate School'];
    let research_interest = d['Research Interest'];
    let h = d['H-index'];
    let c = d['Citations'];
    let adj = d['Publications Divided by Co-authors'];
    let pubs = d['Publications'];

    let content = '<table><tr><td>Name</td><td>' + name + '</td></tr>'
        + '<tr><td>Institution</td><td>'+ institution + '</td></tr>'
        + '<tr><td>Ph.D. Graduation Year</td><td>'+ grad_year + '</td></tr>'
        + '<tr><td>Ph.D. Graduation School</td><td>'+ grad_school + '</td></tr>'
        + '<tr><td>Research Interest</td><td>'+ research_interest + '</td></tr>'
        + '<tr><td>Publications</td><td>'+ pubs + '</td></tr>'
        + '<tr><td>H-index</td><td>'+ h + '</td></tr>'
        + '<tr><td>Citations</td><td>'+ c + '</td></tr>'
        + '<tr><td>Publications Divided by Co-authors</td><td>'+ adj + '</td></tr></table>';

    tooltip.html(content)
        .style('left', (x(d[x_attr]) + 5) + 'px')
        .style('top', ()=>{
            let h = tooltip._groups[0][0].offsetHeight;
            let top = y(d[y_attr]) + 5;
            if(h+top < `${height}`) return top+ 'px'
            else return `${height-h-5}`+'px'
        })
        .style('visibility', 'visible');
}
function cal_width(){
    sumxz = _data.map( d => d.map( val => val[x_attr] )).map( d => {
        let s = 0;
        d.forEach((val)=>{
            if(!isNaN(val))
            s = s+val
        })
        return s;
    });
    sum_school = d3.scaleOrdinal(sumxz,schools_);
    sumxz.sort(function(a,b){return b-a});
    console.log(sumxz)
}
function setInitial(A,attr){
    A._groups[0].forEach(d=>{
        if(d.innerText === attr) d.selected = true;
        else d.selected = false;
    });
}
function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}
function setArray(){
    schools = Array.from(new Set(data.map( d => d['Institution'])));
    schools.push('all');
    years = Array.from(new Set(data.map( d =>  d['Ph.D. Graduation Year'] ))).sort()
        .filter(res=>{return !isNaN(res)});
    years.push('all');
    Institution = d3.select('#Institution')
        .selectAll('option').data(schools).enter().append('option')
        .text(d=>d);
    setInitial(Institution,institution);
    Year = d3.select('#Year')
        .selectAll('option').data(years).enter().append('option')
        .text(d=>d);
    setInitial(Year,year);
    X = d3.select('#x')
        .selectAll('option').data(categories).enter().append('option')
        .text(d=>d);
    setInitial(X,x_attr);
    Y = d3.select('#y')
        .selectAll('option').data(categories).enter().append('option')
        .text(d=>d);
    setInitial(Y,y_attr);
    R = d3.select('#r')
        .selectAll('option').data(categories).enter().append('option')
        .text(d=>d);
    setInitial(R,radius);
    d3.select('#color').checked = isColored;
    // tooltip——CSS提示工具
    tooltip = d3.select('#tooltip');
}
function init(){
    svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);
    // title
    svg.append('g')
        .attr('transform', `translate(${width*0.55}, ${padding.top*0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('A Visualization for Faculties That Research on Computer Science in Well-known Universities');

    let buttons = d3.select('#subtitle');
    buttons.style('left', _width*0.45 + 'px')
        .style('top', `${padding.top*0.5}` + 'px')
        .style('visibility', 'visible');

    d3.select('#years')
        .style('left',width*0.92 + 'px')
        .style('top', height*0.8 + 'px')
        .style('visibility', 'hidden')
}
function ScatterPoint(){
    setInitial(Institution,institution);
    setInitial(Year,year);
    setInitial(X,x_attr);
    setInitial(Y,y_attr);
    setInitial(R,radius);
    padding.left = 0.2*width;
    let selectors = d3.select('#selector');
    selectors.style('left',_width*0.7 + 'px')
        .style('top', `${padding.top*0.7}` + 'px')
        .style('visibility', 'visible');

    // x axis - phd graduation year
    x = d3.scaleLinear()
        .domain(get_min_max(data, x_attr))
        .range([padding.left, width - padding.right]);
    axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);
    // y axis - publications
    y = d3.scaleLinear()
        .domain(get_min_max(data, y_attr))
        .range([height - padding.bottom, padding.top]);//坐标系实际是左上角，因此需要翻过来
    axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);
    // radius - Publications Divided by Co-authors
    r = d3.scaleLinear()
        .domain(get_min_max(data, radius))
        .range([2,8]);

    // x axis
    x_axis = svg.append('g')
        .attr('transform', `translate(${0}, ${height-padding.bottom})`)//x轴移动到底下
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem');
    x_label = svg.append('g')
        .attr('transform', `translate(${padding.left+(width-padding.left-padding.right)/2}, ${height-padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08*height)
        .text(x_attr);

    // y axis
    y_axis = svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem');
    y_label = svg.append('g')
        .attr('transform', `translate(${padding.left}, ${padding.top+50})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height*0.07)
        .text(y_attr);

    // points
    points = svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('opacity','80%')
        .on('mouseover', function(e,d) {
            d3.select(this).transition()
                .attr('r',10)
                .attr('opacity',"20%");
            setTooltip(x,y,d);
        })
        .on('mouseout', function(e,d) {
            d3.select(this).transition()
                .attr('r',d => r(d[radius]) )
            // remove tooltip
            tooltip.style('visibility', 'hidden');
        })

    points.attr('cx', _width/2)
        .attr('cy', _height/2)
        .attr('r', 0)
        .transition().delay((d,i)=>i)
        .attr('cx', d => x(d[x_attr]))
        .attr('cy', d => y(d[y_attr]))
        .attr('r', d => r(d[radius]))
        .attr('fill',d => fill(d));
}
function BarRace() {
    d3.select('#selector')
        .style('left',_width*0.7 + 'px')
        .style('top', `${padding.top*0.7}` + 'px')
        .style('visibility', 'hidden');
    d3.select('#school')
        .style('visibility', 'hidden');
    d3.select('#x-axis')
        .style('visibility', 'visible');
    setInitial(X,x_attr);
    // remove data without x_attr
    data_ = data.filter( d => !isNaN(d[x_attr]) );
    y_attr = 'Institution';
    padding.left = 0.25*width;
    schools_ = schools.filter(d => d!=='all');
    _data = schools_.map( d =>  data_.filter(obj => obj[y_attr]===d))
    cal_width();

    x = d3.scaleLinear()
        .domain([0,Math.max(...sumxz)])
        .range([padding.left, width - padding.right]);
    axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);
    y = d3.scaleBand()
        .domain(sumxz.map(d=>sum_school(d)))
        .range([height-padding.bottom, padding.top])
        .padding(0.1);
    axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);
    // x axis
    x_axis = svg.append('g')
        .attr('transform', `translate(${0}, ${height-padding.bottom})`)//x轴移动到底下
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem');
    x_label = svg.append('g')
        .attr('transform', `translate(${padding.left+(width-padding.left-padding.right)/2}, ${height-padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08*height)
        .text(x_attr);
    // y axis
    y_axis = svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem');
    y_label = svg.append('g')
        .attr('transform', `translate(${padding.left}, ${padding.top+50})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height*0.07)
        .text(y_attr);

    rects = svg.append('g')
        .selectAll('rect').data(sumxz).enter().append('rect')
        .attr('fill', s => institutionColors[sum_school(s)])
        .attr('width',s => `${x(s)-padding.left}`)
        .attr('height',y.bandwidth())
        .attr('opacity',0.8)
    rects.attr('x', _width/2)
        .attr('y', _height/2)
        .transition().delay((d,i)=>i*10)
        .attr('y',s => y(sum_school(s)))
        .attr('x',s => `${padding.left}`)
    texts = svg.append('g')
        .selectAll('text').data(sumxz).enter().append('text')
        .attr('fill','black')
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')
        .attr('y',s => y(sum_school(s))+y.bandwidth()-4)
        .text(s => s)
    texts.attr('x', _width/2)
        .transition().delay((d,i)=>i*10)
        .attr('x',s => x(s)+10)
}
function drawpie(piedata,originaldata){
    svg.selectAll('g').remove();
    init();
    svg.append('g').selectAll('path').data(piedata).enter().append('path')
        .attr('d',d=>arcPath(d))
        .attr('transform',`translate(${width*0.55}, ${height*0.6})`)
        .attr('stroke','#ffffff')
        .attr('stroke-width','0.1px')
        .attr('fill',d=>{
            if(institution === 'all')
                return institutionColors[sum_school(d.value)]
            else
                return institutionColors[institution]
        })
        .attr('opacity','80%')
        .on('mouseover', function(e,d) {
            d3.select(this).transition()
                .attr('opacity',"20%");
            let content;
            if(institution==='all'){
                let institution = sum_school(d.value);
                let value = d.value;
                content = '<table><tr><td>Institution</td><td>'+ institution + '</td></tr>'
                    + `<tr><td>${x_attr}</td><td>`+ value + '</td></tr></table>';
            }else{
                let dd = originaldata[d.index];
                let name = dd['First Name'] + ' ' + dd['Mid Name'] + ' ' + dd['Last Name'];
                let value = d.value;
                content = '<table><tr><td>name</td><td>'+ name + '</td></tr>'
                    + `<tr><td>${x_attr}</td><td>`+ value + '</td></tr></table>';
            }
            // show a tooltip
            tooltip.html(content)
                .style('left', 0.45*width+'px')
                .style('top', 0.6*height+'px')
                .style('visibility', 'visible');

        })
        .on('mouseout', function(e,d) {
            d3.select(this).transition()
                .attr('opacity',"80%");
            // remove tooltip
            tooltip.style('visibility', 'hidden');
        })
}
function SunBurst(){
    setInitial(X,x_attr);
    setInitial(Institution,institution);
    d3.select('#selector')
        .style('left',_width*0.7 + 'px')
        .style('top', `${padding.top*0.7}` + 'px')
        .style('visibility', 'hidden');
    d3.select('#school')
        .style('visibility', 'visible');
    d3.select("#x-axis")
        .style('visibility', 'visible');
    data_ = data.filter( d => !isNaN(d[x_attr]) );
    y_attr = 'Institution';
    padding.left = 0.25*width;
    schools_ = schools.filter(d => d!=='all');
    _data = schools_.map( d =>  data_.filter(obj => obj[y_attr]===d))
    console.log(_data);
    cal_width();
    var piedata = d3.pie()(sumxz);
    arcPath = d3.arc().innerRadius(_width*0.05).outerRadius(_width*0.15);
    drawpie(piedata,sumxz);
}
function draw_main() {
    setArray();
    init();
    d3.select('#bar')
        .on('click',()=>{
            svg.selectAll('g').remove();
            init();
            subtitle = 'BarRace';
            x_attr = 'Publications';
            let aduration = 1000;
            BarRace();
            let update_x = (x_attr) =>{
                let x = d3.scaleLinear()
                    .domain([0,Math.max(...sumxz)])
                    .range([padding.left, width - padding.right]);
                let axis_x = d3.axisBottom()
                    .scale(x)
                    .ticks(10)
                    .tickFormat(d => d);
                return [x, axis_x];
            };
            let update_y = (y_attr) =>{
                let y = d3.scaleBand()
                    .domain(sumxz.map(d=>sum_school(d)))
                    .range([height-padding.bottom, padding.top])
                    .padding(0.1);
                let axis_y = d3.axisLeft()
                    .scale(y)
                    .ticks(10)
                    .tickFormat(d => d);
                return [y,axis_y];
            };
            d3.select('#x')
                .on('change',()=>{
                    X._groups[0].forEach(d=>{
                        if(d.selected === true)
                            x_attr = d.innerText;
                    });
                    cal_width();
                    let [new_x,new_axis_x] = update_x(x_attr);
                    let [new_y,new_axis_y] = update_y(y_attr);
                    x_axis.transition()
                        .duration(aduration)
                        .call(new_axis_x);
                    x_label.transition()
                        .duration(aduration)
                        .text(x_attr);
                    y_axis.transition()
                        .duration(aduration)
                        .call(new_axis_y);
                    y_label.transition()
                        .duration(aduration)
                        .text(y_attr);
                    rects.data(sumxz)
                        .transition().duration(aduration)
                        .attr('width',s => `${new_x(s)-padding.left}`)
                        .attr('y',s => new_y(sum_school(s)))
                        .attr('fill', s => institutionColors[sum_school(s)])
                    texts.data(sumxz)
                        .transition().duration(aduration)
                        .attr('x',s => new_x(s)+10)
                        .attr('y',s => new_y(sum_school(s))+new_y.bandwidth()-4)
                        .text(s => {
                            if(x_attr==='Publications Divided by Co-authors')
                                return s.toFixed(1)
                            else
                                return s
                        })
                });
        })
    d3.select('#scatter')
        .on('click',()=>{
            svg.selectAll('g').remove();
            init();
            radius = 'Publications Divided by Co-authors';
            x_attr = 'Ph.D. Graduation Year';
            subtitle = 'Scatter Points';
            y_attr = 'Publications';
            institution='all';
            year='all';
            let aduration = 1000;
            ScatterPoint();
            let update_x = (x_attr) =>{
                let x = d3.scaleLinear()
                    .domain(get_min_max(data, x_attr))
                    .range([padding.left, width - padding.right]);
                let axis_x = d3.axisBottom()
                    .scale(x)
                    .ticks(10)
                    .tickFormat(d => d);
                return [x, axis_x];
            };
            let update_y = (y_attr) =>{
                let y = d3.scaleLinear()
                    .domain(get_min_max(data,y_attr))
                    .range([height-padding.bottom,padding.top]);
                let axis_y = d3.axisLeft()
                    .scale(y)
                    .ticks(10)
                    .tickFormat(d => d);
                return [y, axis_y];
            };
            let update_r = (radius) =>{
                let r = d3.scaleLinear()
                    .domain(get_min_max(data, radius))
                    .range([2,8]);
                return r;
            }
            d3.select('#Institution')
                .on('change',()=>{
                    Institution._groups[0].forEach(d=>{
                        if(d.selected === true)
                            institution = d.innerText;
                    });
                    points.transition()
                        .duration(aduration)
                        .attr('fill',d => fill(d))
                })
            d3.select('#Year')
                .on('change',()=>{
                    Year._groups[0].forEach(d=>{
                        if(d.selected === true)
                            year = d.innerText;
                    });
                    points.transition()
                        .duration(aduration)
                        .attr('fill',d => fill(d))
                })
            d3.select('#x')
                .on('change',()=>{
                    X._groups[0].forEach(d=>{
                        if(d.selected === true)
                            x_attr = d.innerText;
                    });
                    let [new_x,new_axis_x] = update_x(x_attr);
                    x_axis.transition()
                        .duration(aduration)
                        .call(new_axis_x);
                    x_label.transition()
                        .duration(aduration)
                        .text(x_attr);
                    x = new_x;
                    axis_x = new_axis_x;
                    points.transition()
                        .duration(aduration)
                        .attr('cx', d => {
                            if(!isNaN(d[x_attr]))
                                return new_x(d[x_attr])
                        })
                        .attr('fill',d => fill(d));
                });
            d3.select('#y')
                .on('change',()=>{
                    Y._groups[0].forEach(d=>{
                        if(d.selected === true)
                            y_attr = d.innerText;
                    });
                    let [new_y,new_axis_y] = update_y(y_attr);
                    y_axis.transition()
                        .duration(aduration)
                        .call(new_axis_y);
                    y_label.transition()
                        .duration(aduration)
                        .text(y_attr);
                    y = new_y;
                    axis_y = new_axis_y;
                    points.transition()
                        .duration(aduration)
                        .attr('cy', d => {
                            if(!isNaN(d[y_attr]))
                                return new_y(d[y_attr])
                        })
                        .attr('fill',d => fill(d));
                });
            d3.select('#r')
                .on('change',()=>{
                    R._groups[0].forEach(d=>{
                        if(d.selected === true)
                            radius = d.innerText;
                    });
                    let new_r = update_r(radius);
                    points.transition()
                        .duration(aduration)
                        .attr('r', d => {
                            if(!isNaN(d[radius]))
                                return new_r(d[radius])
                        })
                        .attr('fill',d => fill(d))
                });
            d3.select('#color')
                .on('click',()=>{
                    this.checked = !this.checked;
                    isColored = this.checked;
                    points.transition()
                        .duration(aduration)
                        .attr('fill',d => fill(d))
                });
            d3.select('#animation')
                .on('click',()=>{
                    let dur = 200;
                    let years_ = years.filter(d=>d!=='all');
                    let Text = d3.select('#years')
                        .style('left',width*0.92 + 'px')
                        .style('top', height*0.8 + 'px')
                        .style('visibility', 'visible')
                        .select('text')
                        .attr('class', 'title')
                        .text(years_[0]);
                    let c = 0;
                    let intervalId = setInterval(()=>{
                        if(c>=years_.length) clearInterval(intervalId)
                        else{
                            Text.transition().duration(dur)
                                .text(years_[c])
                            points.transition().duration(dur)
                                .attr('fill',d => {
                                    if(isNaN(d[x_attr]) || isNaN(d[y_attr]) || isNaN(d[radius]) )
                                        return 'none';
                                    else if(institution!=='all' && d['Institution']!==institution)
                                        return 'none';
                                    else if(year!=='all' && d['Ph.D. Graduation Year']!== +(year))
                                        return 'none';
                                    else if(d['Ph.D. Graduation Year'] > years[c])
                                        return 'none'
                                    else if(isColored)
                                        return institutionColors[d['Institution']]
                                    else
                                        return '#1f77b4'
                                })
                            c = c+1;
                        }
                    },dur);
                })
        })
    d3.select('#sunburst')
        .on('click',()=> {
            svg.selectAll('g').remove();
            init();
            x_attr = 'Publications';
            subtitle = 'Sunburst';
            y_attr = 'Institution';
            institution = 'all';
            SunBurst();
            d3.select('#Institution')
                .on('change',()=>{
                    Institution._groups[0].forEach(d=>{
                        if(d.selected === true)
                            institution = d.innerText;
                    });
                    if(institution==='all'){
                        cal_width();
                        drawpie(d3.pie()(sumxz),sumxz);
                    }else{
                        let newdata = data_.filter(obj => obj[y_attr]===institution);
                        let newpiedata = d3.pie()(newdata.map(d=>d[x_attr]));
                        drawpie(newpiedata,newdata);
                    }
                })
            d3.select('#x')
                .on('change',()=> {
                    X._groups[0].forEach(d => {
                        if (d.selected === true)
                            x_attr = d.innerText;
                    });
                    if(institution==='all'){
                        cal_width();
                        drawpie(d3.pie()(sumxz),sumxz);
                    }else{
                        let newdata = data_.filter(obj => obj[y_attr]===institution);
                        let newpiedata = d3.pie()(newdata.map(d=>d[x_attr]));
                        drawpie(newpiedata,newdata);
                    }
                })
        })
}

function main() {
    d3.csv(data_file).then(function(DATA) {
        data = DATA;
        data.forEach( d =>{
            d['Institution Index'] = parseFloat(d['Institution Index']);
            d['Ph.D. Graduation Year'] = parseFloat(d['Ph.D. Graduation Year']);
            d['H-index'] = parseFloat(d['H-index']);
            d['Citations'] = parseFloat(d['Citations']);
            d['Publications'] = parseFloat(d['Publications']);
            d['Publications Divided by Co-authors'] = parseFloat(d['Publications Divided by Co-authors']);
        });
        set_ui();
        draw_main();
    })
}

main()
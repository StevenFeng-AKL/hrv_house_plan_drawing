import React, { useEffect } from 'react';

export default function DrawingWorkspace({ quoteId, address, guid, s1, s2, d1, d2 }) {
    useEffect(() => {
        if (window.initDrawingArea) {
            window.initDrawingArea(quoteId, address, guid, s1, s2, d1, d2);
        }
    }, [quoteId, address, guid, s1, s2, d1, d2]);

    return (
        <div className="container body-content">
            <div id="drawingHeader"
                style={{
                    background: '#f4f4f4', padding: '15px', marginBottom: '5px', 
                    borderRadius: '4px', border: '1px solid #ddd', display: 'flex', 
                    justifyContent: 'space-between', alignItems: 'center'
                }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }} id="displayQuoteId">New HRV House Plan</h2>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#666' }} id="displayAddress"></h4>
            </div>

            <div id="drawingArea">
                <div id="drawing_area">
                    <div className="clear">
                        <div className="pagination">
                            <h3>Pages</h3>
                            <ul>
                                <li><a className="add_page">+</a></li>
                                <li><a className="remove_page">-</a></li>
                            </ul>
                        </div>
                        <div className="background_tools">
                            <h3>Background</h3>
                            <input id="background_file" typeof="file" type="file" className="background_image_file"
                                accept=".png" style={{ display: 'none' }} />
                            <a href="#" className="background_move_tool"
                                onClick={(e) => { e.preventDefault(); document.getElementById('background_file').click(); }}>
                                Choose File
                            </a>
                            <a href="#" className="background_move_tool">Move</a>
                            <a href="#" className="background_rotate_tool">Rotate</a>
                            <a href="#" className="background_scale_tool">Resize</a>
                            <a href="#" className="background_eraser_tool">Erase</a>
                            <a href="#" className="background_clear_tool">Clear</a>
                            <a href="#" className="background_reset_tool">Reset</a>
                        </div>
                        <div className="clear"></div>
                    </div>

                    <div className="clear ventilation_tools" style={{ marginBottom: '15px' }}>
                        <a href="#" className="hrv_outlet_tool">HRV Outlet</a>
                        <a href="#" className="control_panel_tool">Control Panel</a>
                        <a href="#" className="manhole_tool">Manhole</a>
                        <a href="#" className="summer_kit_intake_tool">Summer Kit Intake</a>
                        <a href="#" className="egg_crate_grill_tool">Egg Crate Grill</a>
                        <a href="#" className="louvered_grill_tool">Louvered Grill</a>
                        <a href="#" className="vortex_kit_tool">Vortex Kit</a>
                        <a href="#" className="venting_tool">Venting</a>
                        <a href="#" className="ht_stand_alone_tool">HT Stand Alone</a>
                        <a href="#" className="ht_intake_diff_tool">HT Intake Diff</a>
                        <a href="#" className="ht_outlet_tool">HT Outlet</a>
                        <a href="#" className="switchboard_location_tool">Switchboard Location</a>
                    </div>

                    <div className="tool_panel">
                        <div className="use_snap_container">
                            <input type="checkbox" className="use_snap" defaultChecked /><span>Snap to grid</span>
                        </div>
                        <div id="icons">
                            <div className="snap top-left" id="snap" href="#">
                                <img src="Images/snap_axis_icon.png" alt="S" />
                            </div>
                            <div className="flip top-right" id="flip" href="#">
                                <img src="Images/flip_icon.png" alt="F" />
                            </div>
                            <div className="anticlockwise bottom-left" id="rotateR" href="#">
                                <img src="Images/rotate_l_icon.png" alt="L" />
                            </div>
                            <div className="clockwise bottom-right" id="rotateL" href="#">
                                <img src="Images/rotate_r_icon.png" alt="R" />
                            </div>
                        </div>
                        <div className="toolPreview">
                            <canvas className="preview"></canvas>
                        </div>
                        <a href="#" className="pen_tool">Pen</a>
                        <a href="#" className="eraser_tool">Eraser</a>
                        <a href="#" className="line_tool">Line</a>
                        <a href="#" className="arrow_tool">Arrow</a>
                        <a href="#" className="rectangle_tool">Rectangle</a>
                        <a href="#" className="circle_tool">Circle</a>
                        <input type="text" id="custom_label" />
                        <a href="#" className="custom_label_tool">Label</a>
                        <a href="#" className="door_tool">Door</a>
                        <a href="#" className="window_tool">Window</a>
                        <a href="#" className="stair_tool">Stairs</a>
                        <a href="#" className="gas_meter_tool">Gas Meter</a>
                        <a href="#" className="return_grill_tool">Return Grill</a>
                        <a href="#" className="hazard_tool">Hazard</a>
                        <a href="#" className="other_service_tool">Other Service</a>
                        <div className="heatpump_icons"></div>

                        <a href="#" className="clear_tool">Clear</a>

                        <a href="#" className="colour" style={{ backgroundColor: '#ed3830' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#edbe2f' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#6ced2f' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#2fbeed' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#2f3ced' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#912fed' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#fffb84' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#7f4939' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#333333' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#999999' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#ffffff' }}></a>
                        <a href="#" className="colour" style={{ backgroundColor: '#000000' }}></a>
                    </div>

                    <canvas tabIndex="1" className="drawing"></canvas>
                    <canvas className="key"></canvas>

                    <div className="save_section" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); window.saveToTablet(); }}
                            style={{ padding: '10px 15px', background: '#f0ad4e', color: 'white', textDecoration: 'none', borderRadius: '4px', border: '1px solid #eea236', fontWeight: 'bold', marginRight: '10px' }}>
                            Save to tablet
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); window.saveLocalSession(); }}
                            style={{ padding: '10px 15px', background: '#ed3830', color: 'white', textDecoration: 'none', borderRadius: '4px', border: '1px solid #c9302b', fontWeight: 'bold', marginRight: '10px' }}>
                            Save Session
                        </a>
                        <input type="file" id="loadSessionFile" accept=".json" style={{ display: 'none' }}
                            onChange={(e) => window.loadLocalSession(e)} />
                        <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('loadSessionFile').click(); }}
                            style={{ padding: '10px 15px', background: '#666', color: 'white', textDecoration: 'none', borderRadius: '4px', border: '1px solid #555', fontWeight: 'bold', marginRight: '10px' }}>
                            Load Session
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); window.exportToImage(); }}
                            style={{ padding: '10px 15px', background: '#337ab7', color: 'white', textDecoration: 'none', borderRadius: '4px', border: '1px solid #2e6da4', fontWeight: 'bold', marginRight: '10px' }}>
                            Export Image
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); window.submitWebhook(); }}
                            style={{ padding: '10px 15px', background: '#5cb85c', color: 'white', textDecoration: 'none', borderRadius: '4px', border: '1px solid #4cae4c', fontWeight: 'bold' }}>
                            Submit CRM
                        </a>
                    </div>
                    <div className="clear"></div>
                </div>
            </div>
        </div>
    );
}

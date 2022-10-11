/**
 * XMLWriter - XML generator for Javascript, based on .NET's XMLTextWriter.
 * Copyright (c) 2008-2014 Ariel Flesler - aflesler [a] gmail [d] com | http://flesler.blogspot.com
 * Licensed under BSD (https://raw2.github.com/flesler/XMLWriter/master/LICENSE)
 * @version 1.0.2
 * @author Ariel Flesler
 * http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.html
 */
window.onload = function(){ 
function XMLWriter( encoding, version ){
	if( encoding )
		this.encoding = encoding;
	if( version )
		this.version = version;
};
(function(){
	
var proto = XMLWriter.prototype = {
	/* These are the defaults, you don't need to change them on the original code */
	encoding:'UTF-8',// what is the encoding
	version:'1.0', //what xml version to use
	formatting: 'indented', //how to format the output (indented/none)  ?
	indentChar:'\t', //char to use for indent
	indentation: 1, //how many indentChar to add per level
	newLine: '\n', //character to separate nodes when formatting
	/* */
	//start a new document, cleanup if we are reusing
	writeStartDocument:function( standalone ){
		this.close();//cleanup
		this.stack = [ ];
		this.standalone = standalone;
	},
	//get back to the root
	writeEndDocument:function(){
		this.active = this.root;
		this.stack = [ ];
	},
	//set the text of the doctype
	writeDocType:function( dt ){
		this.doctype = dt;
	},
	//start a new node with this name, and an optional namespace
	writeStartElement:function( name, ns ){
		if( ns )//namespace
			name = ns + ':' + name;
		
		var node = { n:name, a:{ }, c: [ ] };//(n)ame, (a)ttributes, (c)hildren
		
		if( this.active ){
			this.active.c.push(node);
			this.stack.push(this.active);
		}else
			this.root = node;
		this.active = node;
	},
	//go up one node, if we are in the root, ignore it
	writeEndElement:function(){
		this.active = this.stack.pop() || this.root;
	},
	//add an attribute to the active node
	writeAttributeString:function( name, value ){
		if( this.active )
			this.active.a[name] = value;
	},
	//add a text node to the active node
	writeString:function( text ){
		if( this.active )
			this.active.c.push(text);
	},
	//add plain xml content to the active node without any further checks and escaping
	writeXML:function( text ){
		if( this.active )
			this.active.c.push(text);
	},
	//shortcut, open an element, write the text and close
	writeElementString:function( name, text, ns ){
		this.writeStartElement( name, ns ) //take advantage of the chaining
			.writeString(text)
			.writeEndElement();
	},
	//add a text node wrapped with CDATA
	writeCDATA:function( text ){
		// keep nested CDATA
		text = text.replace(/>>]/g, "]]><![CDATA[>");
		this.writeString( '<![CDATA[' + text + ']]>' );
	},
	//add a text node wrapped in a comment
	writeComment:function( text ){
		this.writeString('<!-- ' + text + ' -->');
	},
	//generate the xml string, you can skip closing the last nodes
	flush:function(){		
		this.writeEndDocument();//ensure it's closed
		
		var 
			chr = '', num = this.indentation,
			formatting = this.formatting.toLowerCase() == 'indented',
			buffer = ['<?xml version="'+this.version+'" encoding="'+this.encoding+'"'];
			
		if( this.standalone !== undefined )
			buffer[0] += ' standalone="'+!!this.standalone+'"';
		
		buffer[0] += ' ?>';
		
		if( this.doctype && this.root )
			buffer.push('<!DOCTYPE '+ this.root.n + ' ' + this.doctype+'>'); 
		
		if( formatting ){
			while( num-- )
				chr += this.indentChar;
		}
		
		if( this.root )//skip if no element was added
			format( this.root, '', chr, buffer );
		
		return buffer.join( formatting ? this.newLine : '' );
	},
	//cleanup, don't use again without calling startDocument
	close:function(){
		if( this.root )
			clean( this.root );
		this.active = this.root = this.stack = null;
	},
	getDocument: window.ActiveXObject 
		? function(){ //MSIE
			var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.async = false;
			doc.loadXML(this.flush());
			return doc;
		}
		: function(){//W3C
			return (new DOMParser()).parseFromString(this.flush(),'text/xml');
	}
};

//utility, you don't need it
function clean( node ){
	var l = node.c.length;
	while( l-- ){
		if( typeof node.c[l] == 'object' )
			clean( node.c[l] );
	}
	node.n = node.a = node.c = null;	
};

//utility, you don't need it
function format( node, indent, chr, buffer ){
	var 
		xml = indent + '<' + node.n,
		nc = node.c.length,
		attr, child, i = 0;
		
	for( attr in node.a )
		xml += ' ' + attr + '="' + node.a[attr] + '"';
	
	xml += nc ? '>' : ' />';

	buffer.push( xml );
		
	if( nc ){
		do{
			child = node.c[i++];
			if( typeof child == 'string' ){
				if( nc == 1 )//single text node
					return buffer.push( buffer.pop() + child + '</'+node.n+'>' );					
				else //regular text node
					buffer.push( indent+chr+child );
			}else if( typeof child == 'object' ) //element node
				format(child, indent+chr, chr, buffer);
		}while( i < nc );
		buffer.push( indent + '</'+node.n+'>' );
	}
};

//add chaining! :)
for( var method in proto ){
	if( typeof proto[method] == 'function' && !/flush|getDocument/.test(method) ){
		var original = proto[method];
		proto[method] = function(){
			arguments.callee._o_.apply(this,arguments);
			return this;
		};
		proto[method]._o_ = original;
	}
}

})();

var modal = document.getElementById('myModal');
var btn = document.getElementById("mybutton");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function() {
    modal.style.display = "block";
	var text;
		var sp;
		text = $('textarea').val();
		//alert(sp);
		sp = /\[[^\]]*\]/.exec(text);
		
		var xw = new XMLWriter('UTF-8');
		xw.formatting = 'indented';//add indentation and newlines
		xw.indentChar = ' ';//indent with spaces
		xw.indentation = 2;//add 2 spaces per level

		xw.writeStartDocument( );
		//xw.writeDocType('"items.dtd"');
		//xw.writeComment('button');
	xw.writeStartElement( 'bpmn:definitions' );
	xw.writeAttributeString( 'xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
	xw.writeAttributeString( 'xmlns:bpmn', 'http://www.omg.org/spec/BPMN/20100524/MODEL');
	xw.writeAttributeString( 'xmlns:bpmndi', 'http://www.omg.org/spec/BPMN/20100524/DI');
	xw.writeAttributeString( 'xmlns:dc', 'http://www.omg.org/spec/DD/20100524/DC');
	xw.writeAttributeString( 'xmlns:di', 'http://www.omg.org/spec/DD/20100524/DI');
	xw.writeAttributeString( 'id', 'Definitions_1');
	xw.writeAttributeString( 'targetNamespace', 'http://bpmn.io/schema/bpmn');
	xw.writeStartElement( 'bpmn:process' );
			xw.writeAttributeString( 'id', 'process_1');
			xw.writeAttributeString( 'isExecutable', 'false');
				xw.writeStartElement('bpmn:startEvent');
							var ids = 'startEvent_1';
						xw.writeAttributeString( 'id', ids);
							var idst = 'start_1';
							var idstt = 'start_1';
							var end = 'End_1';
						xw.writeElementString('bpmn:outgoing', idst);
				xw.writeEndElement();

			//xw.writeComment('button');
				var JSONString = sp;
				var recJSON = JSON.parse(JSONString);
				var ln=(recJSON.length)-1;
				var idl;
				var idi;
				var ida;
				var x=297;
				var y=120;
				var x2=195;
				var z=490;
				var l=520;
			$.each(recJSON, function (i, item)
			{

				if(ln==i)
				{
								xw.writeStartElement('bpmn:endEvent');
									xw.writeAttributeString( 'id', end);
									xw.writeElementString('bpmn:incoming', idl);
								xw.writeEndElement();

								xw.writeStartElement('bpmn:sequenceFlow');
									xw.writeAttributeString( 'id', idl);
									xw.writeAttributeString( 'sourceRef', idi);
									xw.writeAttributeString( 'targetRef', end);
								xw.writeEndElement();
						//xw.writeEndElement();
				}
				else{

				if(item.evType == "redirect"){
						//alert("sucess");
							if(idst=="start_1")
							{

													var redd = item.data;
													xw.writeStartElement('bpmn:task');
														xw.writeAttributeString( 'id', i);
														xw.writeAttributeString( 'name', redd);
														xw.writeElementString('bpmn:incoming', idst);
														xw.writeElementString('bpmn:outgoing','sequence_'+i);
													xw.writeEndElement();

													xw.writeStartElement('bpmn:sequenceFlow');
														xw.writeAttributeString( 'id', idst);
														xw.writeAttributeString( 'name', '');
														xw.writeAttributeString( 'sourceRef', ids);
														xw.writeAttributeString( 'targetRef', i);
													xw.writeEndElement();
													idl = 'sequence_'+i;
													idi = i;
													idst = item.data;
							}
							else if(idst!="start_1")
						{
								var chan = item.data;	//from
								var res = item.newValue; //mxp
								//var redd = item.data;
								//var count = i++;
								xw.writeStartElement('bpmn:task');
									xw.writeAttributeString( 'id', i);
									xw.writeAttributeString( 'name', chan);
									xw.writeElementString('bpmn:incoming', idl);
									xw.writeElementString('bpmn:outgoing', 'sequence_'+i);
								xw.writeEndElement();

								xw.writeStartElement('bpmn:sequenceFlow');
									xw.writeAttributeString( 'id', idl);
									xw.writeAttributeString( 'name', '');
									xw.writeAttributeString( 'sourceRef', idi);
									xw.writeAttributeString( 'targetRef', i);
								xw.writeEndElement();
								idi = i;
								idl = 'sequence_'+i;
								idst = item.data;
						//i++;
						}


					}else if(item.evType == "change"){

							if(idst!="start_1")
						{
								var chan = item.data;	//from
								var res = item.newValue; //mxp
								//var redd = item.data;
								//var count = i++;
								xw.writeStartElement('bpmn:task');
									xw.writeAttributeString( 'id', i);
									xw.writeAttributeString( 'name', res);
									xw.writeElementString('bpmn:incoming', idl);
									xw.writeElementString('bpmn:outgoing', 'sequence_'+i);
								xw.writeEndElement();

								xw.writeStartElement('bpmn:sequenceFlow');
									xw.writeAttributeString( 'id', idl);
									xw.writeAttributeString( 'name', chan);
									xw.writeAttributeString( 'sourceRef', idi);
									xw.writeAttributeString( 'targetRef', i);
								xw.writeEndElement();
								idi = i;
								idl = 'sequence_'+i;
								idst = item.newValue;
						//i++;
						}

					}
				}});
	xw.writeEndElement();
	xw.writeStartElement('bpmndi:BPMNDiagram');
		xw.writeAttributeString( 'id', 'BPMNDiagram_1');
			xw.writeStartElement('bpmndi:BPMNPlane');
				xw.writeAttributeString( 'id', 'BPMNPlane_1');
					xw.writeAttributeString( 'bpmnElement','process_1');
						xw.writeStartElement('bpmndi:BPMNShape');
							xw.writeAttributeString( 'id', ids+'_di');
							xw.writeAttributeString( 'bpmnElement',ids);
								xw.writeStartElement('dc:Bounds');
									xw.writeAttributeString( 'x','173');
									xw.writeAttributeString( 'y','102');
									xw.writeAttributeString( 'width','36');
									xw.writeAttributeString( 'height','36');
								xw.writeEndElement();
						xw.writeEndElement();

			$.each(recJSON, function (i, item)
			{

				if(ln==i)
				{
													xw.writeStartElement('bpmndi:BPMNShape');
														xw.writeAttributeString( 'id', 'End_1_di');
														xw.writeAttributeString( 'bpmnElement','End_1');
															xw.writeStartElement('dc:Bounds');
																xw.writeAttributeString( 'x',l+50);
																xw.writeAttributeString( 'y','102');
																xw.writeAttributeString( 'width','36');
																xw.writeAttributeString( 'height','36');
															xw.writeEndElement();
															xw.writeStartElement('bpmndi:BPMNLabel');
																xw.writeStartElement('dc:Bounds');
																	xw.writeAttributeString( 'x',l);
																	xw.writeAttributeString( 'y','142');
																	xw.writeAttributeString( 'width','0');
																	xw.writeAttributeString( 'height','12');
															xw.writeEndElement();
														xw.writeEndElement();
													xw.writeEndElement();
													//x=x+100;
													xw.writeStartElement('bpmndi:BPMNEdge');
														xw.writeAttributeString( 'id', ida+'_di');
														xw.writeAttributeString( 'bpmnElement',ida);
															xw.writeStartElement('di:waypoint');
																xw.writeAttributeString( 'xsi:type','dc:Point');
																xw.writeAttributeString( 'x',l-50);
																xw.writeAttributeString( 'y','120');
															xw.writeEndElement();
													//var x1 = x+100;
													//x=x1;
													
															xw.writeStartElement('di:waypoint');
																xw.writeAttributeString( 'xsi:type','dc:Point');
																xw.writeAttributeString( 'x',l+50);
																xw.writeAttributeString( 'y','120');
															xw.writeEndElement();
															xw.writeStartElement('bpmndi:BPMNLabel');
																xw.writeStartElement('dc:Bounds');
																	xw.writeAttributeString( 'x',l);
																	xw.writeAttributeString( 'y','114');
																	xw.writeAttributeString( 'width','36');
																	xw.writeAttributeString( 'height','36');
																xw.writeEndElement();
															xw.writeEndElement();
													xw.writeEndElement();
				}
				else{

				if(item.evType == "redirect"){
						//alert("sucess");
							if(idstt=="start_1")
							{

													var redd = item.data;
													xw.writeStartElement('bpmndi:BPMNShape');
														xw.writeAttributeString( 'id', i+'_di');
														xw.writeAttributeString( 'bpmnElement',i);
															xw.writeStartElement('dc:Bounds');
																xw.writeAttributeString( 'x','294');
																xw.writeAttributeString( 'y','80');
																xw.writeAttributeString( 'width','100');
																xw.writeAttributeString( 'height','80');
															xw.writeEndElement();
													xw.writeEndElement();
													
													xw.writeStartElement('bpmndi:BPMNEdge');
														xw.writeAttributeString( 'id', idstt+'_di');
														xw.writeAttributeString( 'bpmnElement',idstt);
															xw.writeStartElement('di:waypoint');
																xw.writeAttributeString( 'xsi:type','dc:Point');
																xw.writeAttributeString( 'x','209');
																xw.writeAttributeString( 'y','120');
															xw.writeEndElement();
															xw.writeStartElement('di:waypoint');
																xw.writeAttributeString( 'xsi:type','dc:Point');
																xw.writeAttributeString( 'x','297');
																xw.writeAttributeString( 'y','120');
															xw.writeEndElement();
															xw.writeStartElement('bpmndi:BPMNLabel');
																xw.writeStartElement('dc:Bounds');
																	xw.writeAttributeString( 'x','251.5');
																	xw.writeAttributeString( 'y','99');
																	xw.writeAttributeString( 'width','90');
																	xw.writeAttributeString( 'height','12');
																xw.writeEndElement();
															xw.writeEndElement();
													xw.writeEndElement();

													ida = 'sequence_'+i;
													//idi = i;
													  idstt = item.data;
							}
						else if(idstt!="start_1")
						{
								var chan = item.data;	//from
								var res = item.newValue; //mxp
								//var redd = item.data;
								//var count = i++;
								
								xw.writeStartElement('bpmndi:BPMNShape');
									xw.writeAttributeString( 'id', i+'_di');
										xw.writeAttributeString( 'bpmnElement',i);
											xw.writeStartElement('dc:Bounds');
												xw.writeAttributeString( 'x', z+6);
													xw.writeAttributeString( 'y','80');
													xw.writeAttributeString( 'width','100');
													xw.writeAttributeString( 'height','80');
											xw.writeEndElement();
								xw.writeEndElement();
									x=x+100;
									
									xw.writeStartElement('bpmndi:BPMNEdge');
										xw.writeAttributeString( 'id', ida+'_di');
										xw.writeAttributeString( 'bpmnElement',ida);
											xw.writeStartElement('di:waypoint');
												xw.writeAttributeString( 'xsi:type','dc:Point');
												xw.writeAttributeString( 'x',x);
												xw.writeAttributeString( 'y',y);
											xw.writeEndElement();
									var x1=x+100;
									x=x1;
									x2=x2+210;
											xw.writeStartElement('di:waypoint');
												xw.writeAttributeString( 'xsi:type','dc:Point');
												xw.writeAttributeString( 'x',x);
												xw.writeAttributeString( 'y',y);
											xw.writeEndElement();
											xw.writeStartElement('bpmndi:BPMNLabel');
												xw.writeStartElement('dc:Bounds');
													xw.writeAttributeString( 'x',x2);
													xw.writeAttributeString( 'y','99');
													xw.writeAttributeString( 'width','23');
													xw.writeAttributeString( 'height','12');
												xw.writeEndElement();
											xw.writeEndElement();
									xw.writeEndElement();
								//x= x+175;
								//y= y+163+i;
								z=z+200;
								l=x+150;
								ida = 'sequence_'+i;
								idstt = item.newValue;
						//i++;
						}


					}else if(item.evType == "change"){

							if(idstt!="start_1")
						{
								var chan = item.data;	//from
								var res = item.newValue; //mxp
								//var redd = item.data;
								//var count = i++;
								
								xw.writeStartElement('bpmndi:BPMNShape');
									xw.writeAttributeString( 'id', i+'_di');
										xw.writeAttributeString( 'bpmnElement',i);
											xw.writeStartElement('dc:Bounds');
												xw.writeAttributeString( 'x', z+6);
													xw.writeAttributeString( 'y','80');
													xw.writeAttributeString( 'width','100');
													xw.writeAttributeString( 'height','80');
											xw.writeEndElement();
								xw.writeEndElement();
									x=x+100;
									
									xw.writeStartElement('bpmndi:BPMNEdge');
										xw.writeAttributeString( 'id', ida+'_di');
										xw.writeAttributeString( 'bpmnElement',ida);
											xw.writeStartElement('di:waypoint');
												xw.writeAttributeString( 'xsi:type','dc:Point');
												xw.writeAttributeString( 'x',x);
												xw.writeAttributeString( 'y',y);
											xw.writeEndElement();
									var x1=x+100;
									x=x1;
									x2=x2+210;
											xw.writeStartElement('di:waypoint');
												xw.writeAttributeString( 'xsi:type','dc:Point');
												xw.writeAttributeString( 'x',x);
												xw.writeAttributeString( 'y',y);
											xw.writeEndElement();
											xw.writeStartElement('bpmndi:BPMNLabel');
												xw.writeStartElement('dc:Bounds');
													xw.writeAttributeString( 'x',x2);
													xw.writeAttributeString( 'y','99');
													xw.writeAttributeString( 'width','23');
													xw.writeAttributeString( 'height','12');
												xw.writeEndElement();
											xw.writeEndElement();
									xw.writeEndElement();
								//x= x+175;
								//y= y+163+i;
								z=z+200;
								l=x+150;
								ida = 'sequence_'+i;
								idstt = item.newValue;
						//i++;
						}

					}
				}});

		xw.writeEndElement();
	xw.writeEndElement();
xw.writeEndElement();
xw.writeEndDocument();

		var xml = xw.flush(); //generate the xml string
		xw.close();//clean the writer
		xw = undefined;//don't let visitors use it, it's closed
		//set the xml
		//document.getElementById('parsed-xml').value = xml;
	  // bundle exposes the viewer / modeler via the BpmnJS variable
	  var BpmnViewer = window.BpmnJS;

	  var xmll = xml; // ADD BPMN 2.0 XML HERE

	  var viewer = new BpmnViewer({ container: 'p' });

	  viewer.importXML(xmll, function(err) {

	    if (err) {
	      console.log('error rendering', err);
	    } else {
	      console.log('rendered');
	    }
	  });  
}
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
}
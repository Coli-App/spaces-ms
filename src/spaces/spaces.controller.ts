import {
  Controller,
  Get,
  Post,
  Put, Delete, Body,
  Headers,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { ActivateSpaceDto } from './dto/activate-space.dto';
import { SpaceResponseDto } from './dto/space-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Espacios')
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post('create-space')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Crear un nuevo espacio deportivo',
    description:
      'Crea un espacio deportivo con su información básica y los deportes permitidos en él',
  })
  @ApiBody({ type: CreateSpaceDto })
  @ApiResponse({
    status: 201,
    description: 'Espacio creado exitosamente',
    type: SpaceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o deportes no existen',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async createSpace(
    @UploadedFile() image: Express.Multer.File,
    @Body('data') data: string,
  ) {
    const dto = JSON.parse(data);
    return this.spacesService.createSpace(dto, image);
  }

  @Get('list-spaces')
  @ApiOperation({
    summary: 'Listar todos los espacios deportivos',
    description:
      'Obtiene la lista completa de espacios con sus deportes permitidos. Si se proporciona un token de autorización, incluye información adicional del usuario.',
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Token de autorización Bearer (opcional)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de espacios obtenida exitosamente',
    type: [SpaceResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async listSpaces(
    @Headers('authorization') authHeader?: string,
  ): Promise<SpaceResponseDto[]> {
    const token = authHeader?.replace('Bearer ', '');
    return this.spacesService.listSpaces(token);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un espacio deportivo por ID',
    description:
      'Obtiene la información detallada de un espacio específico incluyendo sus deportes permitidos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del espacio a consultar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Espacio obtenido exitosamente',
    type: SpaceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getSpaceById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SpaceResponseDto> {
    return this.spacesService.getSpaceById(id);
  }

  @Post('activate-space')
  @ApiOperation({
    summary: 'Activar un espacio deportivo',
    description:
      'Cambia el estado de un espacio a "Activo", permitiendo su uso para reservas',
  })
  @ApiBody({ type: ActivateSpaceDto })
  @ApiResponse({
    status: 200,
    description: 'Espacio activado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Espacio activado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async activateSpace(
    @Body() activateSpaceDto: ActivateSpaceDto,
  ): Promise<{ message: string }> {
    return this.spacesService.activateSpace(activateSpaceDto.id);
  }

  @Post('inactivate-space')
  @ApiOperation({
    summary: 'Inactivar un espacio deportivo',
    description:
      'Cambia el estado de un espacio a "Inactivo", deshabilitando su disponibilidad para nuevas reservas',
  })
  @ApiBody({ type: ActivateSpaceDto })
  @ApiResponse({
    status: 200,
    description: 'Espacio inactivado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Espacio inactivado exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async inactivateSpace(
    @Body() activateSpaceDto: ActivateSpaceDto,
  ): Promise<{ message: string }> {
    return this.spacesService.inactivateSpace(activateSpaceDto.id);
  }

  @Put('edit-space/:id')
  @ApiOperation({ 
    summary: 'Editar un espacio deportivo',
    description: 'Actualiza la información de un espacio existente. No se puede modificar el horario.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del espacio a editar',
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateSpaceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Espacio actualizado exitosamente',
    type: SpaceResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Espacio no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async updateSpace(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ): Promise<SpaceResponseDto> {
   
    return this.spacesService.updateSpace(id, updateSpaceDto);
  }

  @Delete('delete-space/:id')
  @ApiOperation({ 
    summary: 'Eliminar un espacio deportivo',
    description: 'Elimina permanentemente un espacio y todas sus relaciones (deportes y horarios)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del espacio a eliminar',
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Espacio eliminado exitosamente',
    schema: { 
      type: 'object', 
      properties: { 
        message: { type: 'string', example: 'Espacio "Cancha Principal" eliminado exitosamente' } 
      } 
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Espacio no encontrado' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async deleteSpace(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.spacesService.deleteSpace(id);
  }
}
